import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PostgresDocumentRepository, PostgresLegalRepository, PostgresReviewRepository, contaSnapshotDatabase, creaSnapshotDatabase } from "../../database/dist/index.js";
import { createCitationLabel } from "../../domain/dist/index.js";
import { archiviaFontiCorpus, creaArchiviazioneOggettiDaEnv, parseDocumentiAkomaNtoso } from "../../ingest/dist/index.js";
import { creaEmbeddingProviderDaEnv, creaGeneratoreRispostaDaEnv, similaritaCoseno } from "../../llm/dist/index.js";
import { getCorpusDimostrativo, rispondiConFontiRag } from "../../retrieval/dist/index.js";
import { NormattivaAdapter, scaricaAttoNormattivaOpenData } from "../../sources/dist/index.js";
import { creaDatabaseDaEnv, databaseConfigurato, isPgliteDatabase } from "../../worker/dist/status.js";
export async function rispondiConFonti(domanda, env = process.env) {
    const rispostaDatabase = await rispondiConFontiDatabase(domanda, env);
    return rispostaDatabase ?? (await rispondiConFontiRag(domanda, {
        embeddingProvider: creaEmbeddingProviderDaEnv(env),
        generatore: creaGeneratoreRispostaDaEnv(env)
    }));
}
export async function rispondiConFontiDatabase(domanda, env = process.env) {
    if (!databaseConfigurato(env)) {
        return null;
    }
    const database = await creaDatabaseDaEnv(env);
    try {
        const rispostaFunzione = await rispondiSuRiferimentiIncrociati(domanda, database, env);
        if (rispostaFunzione) {
            return rispostaFunzione;
        }
        let risultati = await cercaChunkDatabase(domanda, database, env);
        let recuperoFontiOnline = {
            stato: "non-necessario"
        };
        const embeddingProvider = creaEmbeddingProviderDaEnv(env);
        const generatore = creaGeneratoreRispostaDaEnv(env);
        if (risultati.length === 0 || deveTentareRecuperoFontiOnline(domanda, risultati)) {
            recuperoFontiOnline = await tentaRecuperoFontiOnlineSuMiss(domanda, database, env);
            if (recuperoFontiOnline.stato === "riuscito") {
                risultati = await cercaChunkDatabase(domanda, database, env);
            }
            else if (risultati.length > 0 && deveScartareRisultatiNonMirati(domanda, risultati)) {
                risultati = [];
            }
        }
        if (risultati.length === 0) {
            return {
                avvertenza: "Informazione generale: il sistema non sostituisce consulenza legale.",
                citazioni: [],
                domanda,
                fontiRecuperate: [],
                metriche: {
                    coperturaCitazioni: 0,
                    modelloRisposta: generatore.nome,
                    providerEmbedding: embeddingProvider.nome,
                    recuperoFontiOnline,
                    retrieval: "ibrido",
                    richiedeRevisioneUmana: false
                },
                modalita: "rag-locale",
                risposta: "Non ho trovato fonti sufficienti per rispondere in modo verificabile. Prova a indicare l'atto, l'articolo o il tema giuridico.",
                stato: "senza-fonti"
            };
        }
        const fontiRecuperateBase = risultati.map((risultato) => ({
            eli: risultato.metadati.eli,
            id: risultato.id,
            label: risultato.label,
            metadati: risultato.metadati,
            modalita: "ibrida",
            punteggio: risultato.punteggio,
            punteggioLessicale: risultato.punteggioLessicale,
            punteggioSemantico: risultato.punteggioSemantico,
            testo: risultato.testo,
            urlFonte: normalizzaUrlNormattiva(risultato.urlFonte)
        }));
        const riferimentiPerFonte = await leggiRiferimentiNormativiPerFonti(database, fontiRecuperateBase);
        const fontiRecuperate = fontiRecuperateBase.map((fonte) => ({
            ...fonte,
            riferimentiNormativi: riferimentiPerFonte.get(fonte.eli) ?? []
        }));
        const riferimentiNormativi = deduplicaRiferimentiNormativi(fontiRecuperate.flatMap((fonte) => fonte.riferimentiNormativi ?? []));
        const generata = await generatore.genera({
            domanda,
            fonti: fontiRecuperate.map((fonte) => ({
                eli: fonte.eli,
                label: fonte.label,
                metadati: fonte.metadati,
                testo: fonte.testo,
                urlFonte: normalizzaUrlNormattiva(fonte.urlFonte)
            }))
        });
        return {
            avvertenza: "Risposta informativa basata solo sulle fonti mostrate; non è consulenza legale.",
            citazioni: fontiRecuperate.map((fonte) => ({
                eli: fonte.eli,
                idArtefattoFonte: fonte.metadati.idArtefattoFonte,
                label: fonte.label,
                urlFonte: normalizzaUrlNormattiva(fonte.urlFonte)
            })),
            domanda,
            fontiRecuperate,
            metriche: {
                coperturaCitazioni: calcolaCoperturaCitazioni(fontiRecuperate),
                modelloRisposta: generata.modello,
                providerEmbedding: embeddingProvider.nome,
                recuperoFontiOnline,
                retrieval: "ibrido",
                richiedeRevisioneUmana: richiedeRevisioneUmana(domanda)
            },
            modalita: "rag-locale",
            riferimentiNormativi,
            risposta: generata.testo,
            stato: "citata"
        };
    }
    finally {
        await database.end();
    }
}
export async function leggiFonte(id, env = process.env) {
    if (env.DATABASE_URL) {
        return await leggiFonteDaDatabase(id, env);
    }
    const corpus = getCorpusDimostrativo();
    const documento = corpus.documentiFonte.find((item) => item.artefatto.id === id);
    if (!documento) {
        return {
            body: { errore: "Fonte non trovata." },
            status: 404
        };
    }
    return {
        body: {
            artefatto: documento.artefatto,
            contenuto: documento.contenuto,
            contentType: documento.contentType,
            nomeFile: documento.nomeFile,
            unita: corpus.chunks
                .filter((chunk) => chunk.metadati.idArtefattoFonte === id)
                .map((chunk) => ({
                eli: chunk.metadati.eli,
                etichetta: createCitationLabel(chunk.metadati),
                id: chunk.id,
                testo: chunk.testo
            }))
        },
        status: 200
    };
}
export async function leggiReviewQueue(env = process.env, adminToken) {
    const auth = verificaAccessoOperatore(env, adminToken);
    if (!auth.ok) {
        return auth.result;
    }
    if (!env.DATABASE_URL) {
        return {
            body: {
                elementi: [],
                stato: "non-configurato"
            },
            status: 200
        };
    }
    const database = await creaDatabaseDaEnv(env);
    try {
        const elementi = await new PostgresReviewRepository(database).lista(20);
        return {
            body: {
                elementi,
                stato: "ok"
            },
            status: 200
        };
    }
    finally {
        await database.end();
    }
}
export async function aggiornaReview(id, body, env = process.env, adminToken) {
    const auth = verificaAccessoOperatore(env, adminToken);
    if (!auth.ok) {
        return auth.result;
    }
    if (!env.DATABASE_URL) {
        return {
            body: { errore: "Database non configurato: impossibile aggiornare la review." },
            status: 503
        };
    }
    const stato = parseStatoReview(body?.stato);
    if (!id || !stato) {
        return {
            body: { errore: "Id e stato della review sono obbligatori." },
            status: 400
        };
    }
    const database = await creaDatabaseDaEnv(env);
    const repository = new PostgresReviewRepository(database);
    const operatore = body?.operatore?.trim() || body?.assegnataA?.trim() || "operatore";
    try {
        await repository.aggiornaStato({
            assegnataA: body?.assegnataA?.trim() || operatore,
            decisione: body?.decisione?.trim() || undefined,
            id,
            motivo: body?.motivo?.trim() || undefined,
            stato
        });
        await repository.registraEvento({
            id: `review-event:${new Date().toISOString()}:${randomUUID()}`,
            nota: body?.motivo?.trim() || null,
            operatore,
            review_id: id,
            stato_a: stato
        });
        return {
            body: {
                id,
                stato
            },
            status: 200
        };
    }
    finally {
        await database.end();
    }
}
export async function accodaReview(body, env = process.env) {
    if (!env.DATABASE_URL) {
        return {
            body: { errore: "Database non configurato: impossibile accodare la review." },
            status: 503
        };
    }
    const domanda = body?.domanda?.trim();
    const risposta = body?.risposta?.trim();
    if (!body || !domanda || !risposta) {
        return {
            body: { errore: "Domanda e risposta sono obbligatorie per la review." },
            status: 400
        };
    }
    const reviewBody = body;
    const database = await creaDatabaseDaEnv(env);
    const id = `review:${new Date().toISOString()}:${randomUUID()}`;
    try {
        await new PostgresReviewRepository(database).inserisci({
            domanda,
            id,
            motivo: reviewBody.metriche?.richiedeRevisioneUmana
                ? "Risposta marcata automaticamente come ad alto rischio."
                : "Review richiesta manualmente dalla console.",
            payload: {
                citazioni: Array.isArray(reviewBody.citazioni) ? reviewBody.citazioni : [],
                fontiRecuperate: Array.isArray(reviewBody.fontiRecuperate)
                    ? reviewBody.fontiRecuperate
                    : [],
                metriche: reviewBody.metriche ?? {}
            },
            risposta,
            rischio: reviewBody.metriche?.richiedeRevisioneUmana ? "alto" : "medio",
            stato: "in_attesa"
        });
        return {
            body: {
                id,
                stato: "accodata"
            },
            status: 200
        };
    }
    finally {
        await database.end();
    }
}
export async function listaDocumentiUtente(env = process.env, adminToken) {
    const auth = verificaAccessoOperatore(env, adminToken);
    if (!auth.ok) {
        return auth.result;
    }
    if (!env.DATABASE_URL) {
        return {
            body: {
                documenti: [],
                stato: "non-configurato"
            },
            status: 200
        };
    }
    const database = await creaDatabaseDaEnv(env);
    try {
        const documenti = await new PostgresDocumentRepository(database).lista(50);
        return {
            body: {
                documenti,
                stato: "ok"
            },
            status: 200
        };
    }
    finally {
        await database.end();
    }
}
export async function leggiDocumentoUtente(id, env = process.env, adminToken) {
    const auth = verificaAccessoOperatore(env, adminToken);
    if (!auth.ok) {
        return auth.result;
    }
    if (!env.DATABASE_URL) {
        return {
            body: { errore: "Database non configurato." },
            status: 503
        };
    }
    const database = await creaDatabaseDaEnv(env);
    try {
        const documento = await new PostgresDocumentRepository(database).leggi(id);
        if (!documento) {
            return {
                body: { errore: "Documento non trovato." },
                status: 404
            };
        }
        return {
            body: {
                documento
            },
            status: 200
        };
    }
    finally {
        await database.end();
    }
}
export async function salvaDocumentoUtente(body, env = process.env, adminToken) {
    const auth = verificaAccessoOperatore(env, adminToken);
    if (!auth.ok) {
        return auth.result;
    }
    if (!env.DATABASE_URL) {
        return {
            body: { errore: "Database non configurato: impossibile salvare documenti." },
            status: 503
        };
    }
    const nomeFile = sanitizeFileName(body?.nomeFile ?? "documento.txt");
    const contentType = body?.contentType?.trim() || "application/octet-stream";
    const contenutoBase64 = body?.contenutoBase64?.trim();
    if (!contenutoBase64) {
        return {
            body: { errore: "Il contenuto del documento è obbligatorio." },
            status: 400
        };
    }
    const buffer = Buffer.from(contenutoBase64, "base64");
    const maxBytes = Number(env.DOCUMENT_UPLOAD_MAX_BYTES ?? 8 * 1024 * 1024);
    if (buffer.byteLength === 0 || buffer.byteLength > maxBytes) {
        return {
            body: {
                errore: `Documento vuoto o superiore al limite di ${Math.round(maxBytes / 1024 / 1024)} MB.`
            },
            status: 400
        };
    }
    const id = `documento:${new Date().toISOString()}:${randomUUID()}`;
    const storage = creaArchiviazioneOggettiDaEnv(env);
    const archived = await storage.salvaArtefatto({
        body: buffer,
        chiave: `documenti/${id}/${nomeFile}`,
        contentType,
        metadati: {
            nomeFile,
            origine: "upload-utente"
        }
    });
    const row = {
        anteprima_testo: creaAnteprimaDocumento(buffer, contentType),
        caricato_da: body?.caricatoDa?.trim() || undefined,
        content_type: contentType,
        dimensione_byte: buffer.byteLength,
        id,
        nome_file: nomeFile,
        sha256: createHash("sha256").update(buffer).digest("hex"),
        stato: "archiviato",
        storage_uri: archived.uri
    };
    const database = await creaDatabaseDaEnv(env);
    try {
        await new PostgresDocumentRepository(database).inserisci(row);
        return {
            body: {
                documento: row,
                stato: "archiviato"
            },
            status: 201
        };
    }
    finally {
        await database.end();
    }
}
async function leggiRiferimentiNormativiPerFonti(database, fonti) {
    if (fonti.length === 0) {
        return new Map();
    }
    const chiavi = uniqueStrings(fonti.flatMap((fonte) => [fonte.eli, eliNormaDaUnita(fonte.eli)]));
    try {
        const result = (await database.query(`select da_eli,
  a_eli,
  tipo,
  fonte_estrazione,
  testo_match,
  confidenza,
  stato_risoluzione,
  target_risolto,
  target_fonte,
  target_titolo,
  target_url_fonte
from riferimenti_normativi
where da_eli = any($1::text[])
  or a_eli = any($1::text[])
order by target_risolto desc, tipo, a_eli
limit 200`, [chiavi]));
        const rows = result.rows ?? [];
        const output = new Map();
        for (const fonte of fonti) {
            const fonteKeys = new Set([fonte.eli, eliNormaDaUnita(fonte.eli)]);
            const riferimenti = rows
                .map((row) => formattaRiferimentoNormativo(row, fonteKeys))
                .filter((row) => Boolean(row));
            output.set(fonte.eli, deduplicaRiferimentiNormativi(riferimenti).slice(0, 8));
        }
        return output;
    }
    catch (error) {
        if (isMissingReferenceGraphError(error)) {
            return new Map();
        }
        throw error;
    }
}
async function rispondiSuRiferimentiIncrociati(domanda, database, env) {
    if (!isDomandaSuFunzioneRiferimentiIncrociati(normalizza(domanda))) {
        return null;
    }
    const embeddingProvider = creaEmbeddingProviderDaEnv(env);
    const generatore = creaGeneratoreRispostaDaEnv(env);
    try {
        const result = (await database.query(`select c.id,
  c.testo,
  c.artefatto_fonte_id,
  c.citation_eli,
  c.citation_fonte,
  c.citation_tipo_atto,
  c.citation_numero_atto,
  c.citation_data_atto,
  c.citation_articolo,
  c.citation_comma,
  c.citation_vigenza_da,
  c.citation_vigenza_a,
  c.citation_url_fonte,
  1 as punteggio_semantico,
  r.da_eli,
  r.a_eli,
  r.tipo,
  r.fonte_estrazione,
  r.testo_match,
  r.confidenza,
  r.stato_risoluzione,
  r.target_risolto,
  r.target_fonte,
  r.target_titolo,
  r.target_url_fonte
from riferimenti_normativi r
join chunk_normativi c on c.citation_eli = r.da_eli
where r.target_url_fonte is not null
order by r.target_risolto desc, r.confidenza desc nulls last, c.citation_fonte, c.citation_numero_atto
limit 5`));
        const rows = result.rows ?? [];
        if (rows.length === 0) {
            return {
                avvertenza: "Informazione generale: il sistema non sostituisce consulenza legale.",
                citazioni: [],
                domanda,
                fontiRecuperate: [],
                metriche: {
                    coperturaCitazioni: 0,
                    modelloRisposta: generatore.nome,
                    providerEmbedding: embeddingProvider.nome,
                    retrieval: "ibrido",
                    richiedeRevisioneUmana: false
                },
                modalita: "rag-locale",
                risposta: "Sì: il sistema prevede i riferimenti incrociati, ma nell'indice corrente non ho trovato esempi consultabili da mostrare.",
                stato: "senza-fonti"
            };
        }
        const fontiPerId = new Map();
        rows.forEach((row) => {
            const metadati = citationMetadataFromRow(row);
            const riferimento = formattaRiferimentoNormativo(row, new Set([metadati.eli, eliNormaDaUnita(metadati.eli)]));
            const id = String(row.id);
            const esistente = fontiPerId.get(id);
            if (esistente) {
                if (riferimento) {
                    esistente.riferimentiNormativi = deduplicaRiferimentiNormativi([
                        ...(esistente.riferimentiNormativi ?? []),
                        riferimento
                    ]);
                }
                return;
            }
            const index = fontiPerId.size;
            fontiPerId.set(id, {
                eli: metadati.eli,
                id,
                label: createCitationLabel(metadati),
                metadati,
                modalita: "ibrida",
                punteggio: Number((100 - index).toFixed(4)),
                punteggioLessicale: 100 - index,
                punteggioSemantico: 1,
                riferimentiNormativi: riferimento ? [riferimento] : [],
                testo: String(row.testo),
                urlFonte: normalizzaUrlNormattiva(metadati.urlFonte)
            });
        });
        const fontiRecuperate = [...fontiPerId.values()];
        const riferimentiNormativi = deduplicaRiferimentiNormativi(fontiRecuperate.flatMap((fonte) => fonte.riferimentiNormativi ?? []));
        const generata = await generatore.genera({
            domanda,
            fonti: fontiRecuperate.map((fonte) => ({
                eli: fonte.eli,
                label: fonte.label,
                metadati: fonte.metadati,
                testo: testoFonteConRiferimenti(fonte),
                urlFonte: normalizzaUrlNormattiva(fonte.urlFonte)
            }))
        });
        return {
            avvertenza: "Risposta informativa basata solo sulle fonti mostrate; non è consulenza legale.",
            citazioni: fontiRecuperate.map((fonte) => ({
                eli: fonte.eli,
                idArtefattoFonte: fonte.metadati.idArtefattoFonte,
                label: fonte.label,
                urlFonte: normalizzaUrlNormattiva(fonte.urlFonte)
            })),
            domanda,
            fontiRecuperate,
            metriche: {
                coperturaCitazioni: calcolaCoperturaCitazioni(fontiRecuperate),
                modelloRisposta: generata.modello,
                providerEmbedding: embeddingProvider.nome,
                retrieval: "ibrido",
                richiedeRevisioneUmana: false
            },
            modalita: "rag-locale",
            riferimentiNormativi,
            risposta: generata.testo,
            stato: "citata"
        };
    }
    catch (error) {
        if (isMissingReferenceGraphError(error)) {
            return null;
        }
        throw error;
    }
}
function testoFonteConRiferimenti(fonte) {
    const riferimenti = (fonte.riferimentiNormativi ?? [])
        .map((riferimento) => {
        const stato = riferimento.statoRisoluzione === "risolto"
            ? "risolto nell'archivio"
            : riferimento.statoRisoluzione === "esterno"
                ? `esterno${riferimento.targetFonte ? `: ${riferimento.targetFonte}` : ""}`
                : "pendente";
        return `${riferimento.testoMatch ?? riferimento.label} (${stato})`;
    })
        .join("; ");
    return riferimenti ? `${fonte.testo}\n\nRiferimenti normativi collegati: ${riferimenti}.` : fonte.testo;
}
function formattaRiferimentoNormativo(row, fonteKeys) {
    const daEli = String(row.da_eli);
    const aEli = String(row.a_eli);
    const direzione = fonteKeys.has(daEli)
        ? "in-uscita"
        : fonteKeys.has(aEli)
            ? "in-entrata"
            : null;
    if (!direzione) {
        return null;
    }
    const tipo = parseTipoRiferimento(row.tipo);
    const statoRisoluzione = parseStatoRisoluzione(row.stato_risoluzione);
    const targetTitolo = pulisciTitoloFonte(stringOrUndefined(row.target_titolo));
    const targetFonte = stringOrUndefined(row.target_fonte);
    const targetUrlFonte = normalizzaUrlNormattiva(stringOrUndefined(row.target_url_fonte));
    const label = creaEtichettaRiferimentoNormativo({
        aEli,
        direzione,
        targetFonte,
        targetTitolo,
        tipo
    });
    return {
        aEli,
        confidenza: numberOrUndefined(row.confidenza),
        daEli,
        direzione,
        fonteEstrazione: parseFonteEstrazione(row.fonte_estrazione),
        label,
        statoRisoluzione,
        targetFonte,
        targetRisolto: Boolean(row.target_risolto),
        targetTitolo,
        targetUrlFonte,
        testoMatch: stringOrUndefined(row.testo_match),
        tipo
    };
}
function creaEtichettaRiferimentoNormativo(input) {
    const azione = input.direzione === "in-uscita"
        ? labelTipoRiferimento(input.tipo)
        : `richiamata da ${labelTipoRiferimento(input.tipo)}`;
    const target = input.targetTitolo ?? formattaEliCompatto(input.aEli);
    const fonte = input.targetFonte ? ` - ${input.targetFonte}` : "";
    return `${azione}: ${target}${fonte}`;
}
function labelTipoRiferimento(tipo) {
    if (tipo === "abrogazione") {
        return "abrogazione";
    }
    if (tipo === "modifica") {
        return "modifica";
    }
    if (tipo === "recepimento-ue") {
        return "collegamento UE";
    }
    return "rinvio";
}
function deduplicaRiferimentiNormativi(riferimenti) {
    const seen = new Set();
    const output = [];
    for (const riferimento of riferimenti) {
        const key = `${riferimento.direzione}:${riferimento.daEli}:${riferimento.aEli}:${riferimento.tipo}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        output.push(riferimento);
    }
    return output;
}
function eliNormaDaUnita(value) {
    const index = value.indexOf("/articolo/");
    return index > 0 ? value.slice(0, index) : value;
}
function formattaEliCompatto(value) {
    const treaty = value.match(/^\/eli\/treaty\/([^/]+)\/art_?([0-9]+)\/oj$/);
    if (treaty) {
        const trattato = treaty[1]?.toUpperCase().replace(/_[0-9]{4}$/, "") ?? "UE";
        return `Articolo ${treaty[2]} ${trattato}`;
    }
    const eu = value.match(/^\/eli\/(reg|dir|dec)\/(\d{4})\/([^/]+)\/oj$/);
    if (eu) {
        const tipo = eu[1] === "reg" ? "Regolamento UE" : eu[1] === "dir" ? "Direttiva UE" : "Decisione UE";
        return `${tipo} ${eu[2]}/${eu[3]}`;
    }
    const italiana = value.match(/^\/eli\/it\/stato\/([^/]+)\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)/);
    if (italiana) {
        return `${italiana[1]?.replaceAll("-", " ")} ${italiana[5]}/${italiana[2]}`;
    }
    return value;
}
function parseTipoRiferimento(value) {
    const tipo = String(value);
    if (tipo === "rinvio" ||
        tipo === "modifica" ||
        tipo === "abrogazione" ||
        tipo === "recepimento-ue") {
        return tipo;
    }
    return "rinvio";
}
function parseStatoRisoluzione(value) {
    const stato = String(value);
    if (stato === "risolto" || stato === "esterno" || stato === "pendente") {
        return stato;
    }
    return "pendente";
}
function parseFonteEstrazione(value) {
    const fonte = String(value);
    if (fonte === "akn-ref" || fonte === "testo-regex") {
        return fonte;
    }
    return undefined;
}
function numberOrUndefined(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
}
function pulisciTitoloFonte(value) {
    const cleaned = value?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return cleaned && cleaned.length > 0 ? cleaned : undefined;
}
async function cercaChunkDatabase(domanda, database, env) {
    const riferimentiEspliciti = estraiRiferimentiNormativiDomanda(domanda).filter((riferimento) => haRiferimentoNormativoAzionabile(riferimento));
    if (riferimentiEspliciti.length === 0) {
        const locazione = await cercaDurataLocazioneDatabase(domanda, database);
        if (locazione.length > 0) {
            return locazione;
        }
    }
    const provider = creaEmbeddingProviderDaEnv(env);
    const embedding = await provider.generaEmbedding(domanda);
    if (riferimentiEspliciti.length > 0) {
        const risultatiMirati = await cercaChunkDatabasePerRiferimenti(domanda, database, embedding, riferimentiEspliciti);
        if (risultatiMirati.length > 0) {
            return risultatiMirati;
        }
    }
    const riferimento = riferimentiEspliciti[0] ?? estraiRiferimentoDomanda(domanda);
    let query = isPgliteDatabase(database)
        ? creaQueryChunkDatabaseCompatibile(riferimento)
        : creaQueryChunkDatabase(embedding, riferimento);
    let result = (await database.query(query.text, query.values));
    if (query.filtroStrutturato && (result.rows?.length ?? 0) === 0) {
        return [];
    }
    const rows = isPgliteDatabase(database)
        ? ordinaChunkCompatibiliPerEmbedding(result.rows ?? [], embedding).slice(0, 80)
        : (result.rows ?? []);
    const tokensDomanda = tokenizza(domanda);
    const dominioGiuridico = query.filtroStrutturato || haSegnaliGiuridici(tokensDomanda);
    const ranked = rows
        .map((row) => formattaRisultatoDatabase(row, domanda, tokensDomanda, riferimento))
        .filter((resultItem) => superaRilevanzaMinimaDatabase(resultItem, query.filtroStrutturato, riferimento, dominioGiuridico))
        .sort((left, right) => right.punteggio - left.punteggio);
    const migliore = ranked[0]?.punteggio ?? 0;
    const soglia = query.filtroStrutturato
        ? 0
        : migliore <= 2
            ? 0.45
            : Math.max(1, migliore * 0.25);
    return ranked.filter((resultItem) => resultItem.punteggio >= soglia).slice(0, 8);
}
async function cercaChunkDatabasePerRiferimenti(domanda, database, embedding, riferimenti) {
    const tokensDomanda = tokenizza(domanda);
    const risultatiPerId = new Map();
    for (const riferimento of riferimenti.slice(0, 12)) {
        const query = isPgliteDatabase(database)
            ? creaQueryChunkDatabaseCompatibile(riferimento)
            : creaQueryChunkDatabase(embedding, riferimento);
        const result = (await database.query(query.text, query.values));
        const rows = isPgliteDatabase(database)
            ? ordinaChunkCompatibiliPerEmbedding(result.rows ?? [], embedding).slice(0, 80)
            : (result.rows ?? []);
        const quota = riferimento.comma ? 2 : 3;
        const ranked = rows
            .map((row) => formattaRisultatoDatabase(row, domanda, tokensDomanda, riferimento))
            .filter((resultItem) => metadatiSoddisfanoRiferimento(resultItem.metadati, riferimento))
            .sort((left, right) => right.punteggio - left.punteggio)
            .slice(0, quota);
        for (const resultItem of ranked) {
            if (!risultatiPerId.has(resultItem.id)) {
                risultatiPerId.set(resultItem.id, resultItem);
            }
        }
    }
    return [...risultatiPerId.values()].slice(0, 12);
}
async function tentaRecuperoFontiOnlineSuMiss(domanda, database, env) {
    if (env.ONLINE_SOURCE_RECOVERY_ENABLED === "false") {
        return {
            stato: "non-applicabile"
        };
    }
    const urns = pianificaUrnNormattivaPerRecupero(domanda);
    if (urns.length === 0) {
        return {
            errore: "Nessuna fonte online Normattiva pianificabile dalla domanda. Indicare atto, numero, anno, articolo o un URL/URN Normattiva.",
            stato: "fallito",
            urns
        };
    }
    try {
        if (isPgliteDatabase(database)) {
            const result = await importaUrnNormattivaNelDatabase(urns, database, env);
            return {
                chunkNormativi: result.chunkNormativi,
                jobId: result.jobId,
                stato: result.chunkNormativi > 0 ? "riuscito" : "fallito",
                urns
            };
        }
        const result = await importaUrnNormattivaTramiteWorker(urns, env);
        return {
            chunkNormativi: result.chunkNormativi,
            jobId: result.jobId,
            stato: result.chunkNormativi > 0 ? "riuscito" : "fallito",
            urns
        };
    }
    catch (error) {
        if (env.ONLINE_SOURCE_RECOVERY_API_FALLBACK === "true") {
            try {
                const result = await importaUrnNormattivaNelDatabase(urns, database, env);
                return {
                    chunkNormativi: result.chunkNormativi,
                    jobId: result.jobId,
                    stato: result.chunkNormativi > 0 ? "riuscito" : "fallito",
                    urns
                };
            }
            catch (fallbackError) {
                return {
                    errore: fallbackError instanceof Error ? fallbackError.message : "Recupero online non riuscito.",
                    stato: "fallito",
                    urns
                };
            }
        }
        return {
            errore: error instanceof Error ? error.message : "Recupero online non riuscito.",
            stato: "fallito",
            urns
        };
    }
}
function deveTentareRecuperoFontiOnline(domanda, risultati) {
    const urns = pianificaUrnNormattivaPerRecupero(domanda);
    if (urns.length === 0 || risultati.length === 0) {
        return urns.length > 0;
    }
    const riferimenti = estraiRiferimentiNormativiDomanda(domanda).filter((riferimento) => haRiferimentoNormativoAzionabile(riferimento));
    if (riferimenti.length > 0) {
        return riferimenti.some((riferimento) => !risultati.some((risultato) => metadatiSoddisfanoRiferimento(risultato.metadati, riferimento)));
    }
    const riferimento = estraiRiferimentoDomanda(domanda);
    if (!haRiferimentoNormativoAzionabile(riferimento)) {
        return false;
    }
    return !risultati.some((risultato) => metadatiSoddisfanoRiferimento(risultato.metadati, riferimento));
}
function deveScartareRisultatiNonMirati(domanda, risultati) {
    const riferimenti = estraiRiferimentiNormativiDomanda(domanda).filter((riferimento) => haRiferimentoNormativoAzionabile(riferimento));
    if (riferimenti.length > 0) {
        return (risultati.length > 0 &&
            !risultati.some((risultato) => riferimenti.some((riferimento) => metadatiSoddisfanoRiferimento(risultato.metadati, riferimento))));
    }
    const riferimento = estraiRiferimentoDomanda(domanda);
    return (haRiferimentoNormativoAzionabile(riferimento) &&
        risultati.length > 0 &&
        !risultati.some((risultato) => metadatiSoddisfanoRiferimento(risultato.metadati, riferimento)));
}
function haRiferimentoNormativoAzionabile(riferimento) {
    return Boolean(riferimento.fonte ||
        riferimento.tipoAtto ||
        riferimento.numeroAtto ||
        riferimento.annoAtto ||
        riferimento.articolo);
}
function metadatiSoddisfanoRiferimento(metadati, riferimento) {
    if (riferimento.fonte && metadati.fonte !== riferimento.fonte) {
        return false;
    }
    if (riferimento.tipoAtto && metadati.tipoAtto !== riferimento.tipoAtto) {
        return false;
    }
    if (riferimento.numeroAtto && metadati.numeroAtto !== riferimento.numeroAtto) {
        return false;
    }
    if (riferimento.annoAtto && !metadati.dataAtto.startsWith(riferimento.annoAtto)) {
        return false;
    }
    if (riferimento.articolo &&
        normalizzaIdentificatoreNormativo(metadati.articolo) !== riferimento.articolo) {
        return false;
    }
    if (riferimento.comma &&
        normalizzaComma(metadati.comma) !== normalizzaComma(riferimento.comma)) {
        return false;
    }
    return true;
}
async function importaUrnNormattivaTramiteWorker(urns, env) {
    const workerCli = env.ONLINE_SOURCE_RECOVERY_WORKER_CLI ??
        fileURLToPath(new URL("../../worker/dist/cli.js", import.meta.url));
    const timeoutMs = Number(env.ONLINE_SOURCE_RECOVERY_WORKER_TIMEOUT_MS ?? 180000);
    const output = await execFileJson(process.execPath, [
        workerCli,
        "recover-online",
        ...urns
    ], {
        cwd: env.MAGISTRA_RUNTIME_ROOT || process.cwd(),
        env: {
            ...process.env,
            ...env,
            ONLINE_RECOVERY_URNS: JSON.stringify(urns),
            WORKER_IMPORT_DATABASE: "true",
            WORKER_MIGRATE_BEFORE_ONLINE_RECOVERY: env.WORKER_MIGRATE_BEFORE_ONLINE_RECOVERY ?? "false"
        },
        timeoutMs
    });
    return {
        chunkNormativi: Number(output.chunkNormativi ?? output.conteggi?.chunk_normativi ?? 0),
        jobId: String(output.jobId ?? "")
    };
}
async function execFileJson(file, args, options) {
    const stdout = await new Promise((resolve, reject) => {
        execFile(file, args, {
            cwd: options.cwd,
            env: options.env,
            maxBuffer: 20 * 1024 * 1024,
            timeout: options.timeoutMs,
            windowsHide: true
        }, (error, stdoutValue, stderrValue) => {
            if (error) {
                const detail = stderrValue?.toString().trim();
                reject(new Error(detail ? `${error.message}: ${detail}` : error.message));
                return;
            }
            resolve(stdoutValue.toString());
        });
    });
    const jsonStart = stdout.indexOf("{");
    if (jsonStart === -1) {
        throw new Error("Worker recupero online non ha restituito JSON.");
    }
    return JSON.parse(stdout.slice(jsonStart));
}
async function importaUrnNormattivaNelDatabase(urns, database, env) {
    const jobId = `online-recovery:${new Date().toISOString()}:${randomUUID()}`;
    const adapter = new NormattivaAdapter();
    const documenti = [];
    for (const urn of urns) {
        const scaricato = await scaricaAttoNormattivaOpenData(adapter, urn);
        documenti.push({
            artifactId: `normattiva:online-recovery:${hashBreve(urn)}`,
            fonte: scaricato.fonte.nome,
            sourceUrl: scaricato.sourceUrl,
            stato: "vigente",
            xml: scaricato.xml
        });
    }
    const embeddingProvider = creaEmbeddingProviderDaEnv(env);
    const corpus = parseDocumentiAkomaNtoso(documenti);
    const chunks = await Promise.all(corpus.chunks.map(async (chunk) => ({
        ...chunk,
        embedding: chunk.embedding ?? (await embeddingProvider.generaEmbedding(chunk.testo))
    })));
    const corpusConEmbedding = {
        ...corpus,
        chunks
    };
    const storage = creaArchiviazioneOggettiDaEnv(env);
    await archiviaFontiCorpus(corpusConEmbedding, storage);
    const snapshot = creaSnapshotDatabase(corpusConEmbedding);
    await new PostgresLegalRepository(database).upsertSnapshot(snapshot);
    return {
        chunkNormativi: contaSnapshotDatabase(snapshot).chunk_normativi,
        jobId
    };
}
export function pianificaUrnNormattivaPerRecupero(domanda) {
    const testoRiferimenti = testoPerRiferimentiNormativi(domanda);
    const normalized = normalizza(testoRiferimenti).replace(/\s+/g, " ").trim();
    const riferimenti = estraiRiferimentiNormativiDomanda(domanda);
    return deduplicaUrnNormattiva([
        ...estraiUrnNormattivaDaTesto(domanda),
        ...riferimenti.flatMap((riferimento) => pianificaUrnNormattivaDaRiferimento(riferimento, normalized)),
        ...pianificaUrnNormattivaDaTema(normalized)
    ]);
}
function pianificaUrnNormattivaDaRiferimento(riferimento, normalized) {
    if (riferimento.fonte && riferimento.fonte !== "Normattiva") {
        return [];
    }
    if (riferimento.tipoAtto === "trattato-ue") {
        return [];
    }
    const attoConosciuto = attoNormattivaConosciuto(riferimento, normalized);
    const tipoAtto = attoConosciuto?.tipoAttoUrn ??
        tipoAttoNormattivaPerUrn(riferimento.tipoAtto, normalized);
    const numeroAtto = attoConosciuto?.numeroAtto ?? riferimento.numeroAtto;
    const annoAtto = attoConosciuto?.annoAtto ?? riferimento.annoAtto;
    if (!tipoAtto || !numeroAtto || !annoAtto) {
        return [];
    }
    const dataAtto = attoConosciuto?.dataAtto ?? estraiDataAttoDaDomanda(normalized, annoAtto) ?? annoAtto;
    return [
        creaUrnNormattiva({
            articolo: riferimento.articolo,
            dataAtto,
            numeroAtto,
            tipoAttoUrn: tipoAtto
        })
    ];
}
function pianificaUrnNormattivaDaTema(normalized) {
    const urns = [];
    if (isDomandaSuDurataLocazione(normalized)) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.legge4311998, "2"));
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.legge3921978, "27"));
        if (normalized.includes("rinnov")) {
            urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.legge3921978, "28"));
        }
    }
    if (normalized.includes("motivazione") &&
        (normalized.includes("provvedimento") ||
            normalized.includes("procedimento") ||
            normalized.includes("amministrativ"))) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.legge2411990, "3"));
    }
    if (normalized.includes("princip") &&
        (normalized.includes("attivita amministrativa") ||
            normalized.includes("procedimento amministrativo"))) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.legge2411990, "1"));
    }
    if (normalized.includes("accesso civico") || normalized.includes("trasparenza")) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.decreto33_2013, "5"));
        if (normalized.includes("limit") || normalized.includes("esclusion")) {
            urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.decreto33_2013, "5-bis"));
        }
    }
    if (normalized.includes("danno ingiusto")) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.codiceCivile, "2043"));
    }
    if (normalized.includes("onere della prova") || normalized.includes("onere probatorio")) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.codiceCivile, "2697"));
    }
    if (isDomandaSuClausoleVessatorie(normalized)) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.codiceCivile, "1341"));
        if (normalized.includes("formular") || normalized.includes("modul") || normalized.includes("standard")) {
            urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.codiceCivile, "1342"));
        }
    }
    if (isDomandaSuIgnoranzaLeggePenale(normalized)) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.codicePenale, "5"));
    }
    if (isDomandaSuImpugnazioneLicenziamento(normalized)) {
        urns.push(creaUrnNormattiva(ATTI_NORMATTIVA_CONOSCIUTI.legge6041966, "6"));
    }
    return urns;
}
const ATTI_NORMATTIVA_CONOSCIUTI = {
    codiceCivile: {
        annoAtto: "1942",
        dataAtto: "1942-03-16",
        numeroAtto: "262",
        tipoAttoUrn: "regio.decreto"
    },
    codicePenale: {
        annoAtto: "1930",
        dataAtto: "1930-10-19",
        numeroAtto: "1398",
        tipoAttoUrn: "regio.decreto"
    },
    codiceProceduraCivile: {
        annoAtto: "1940",
        dataAtto: "1940-10-28",
        numeroAtto: "1443",
        tipoAttoUrn: "regio.decreto"
    },
    codiceProceduraPenale: {
        annoAtto: "1988",
        dataAtto: "1988-09-22",
        numeroAtto: "447",
        tipoAttoUrn: "decreto.presidente.repubblica"
    },
    codiceProcessoAmministrativo: {
        annoAtto: "2010",
        dataAtto: "2010-07-02",
        numeroAtto: "104",
        tipoAttoUrn: "decreto.legislativo"
    },
    codiceAmministrazioneDigitale: {
        annoAtto: "2005",
        dataAtto: "2005-03-07",
        numeroAtto: "82",
        tipoAttoUrn: "decreto.legislativo"
    },
    codiceContrattiPubblici: {
        annoAtto: "2023",
        dataAtto: "2023-03-31",
        numeroAtto: "36",
        tipoAttoUrn: "decreto.legislativo"
    },
    codicePrivacy: {
        annoAtto: "2003",
        dataAtto: "2003-06-30",
        numeroAtto: "196",
        tipoAttoUrn: "decreto.legislativo"
    },
    decreto33_2013: {
        annoAtto: "2013",
        dataAtto: "2013-03-14",
        numeroAtto: "33",
        tipoAttoUrn: "decreto.legislativo"
    },
    legge2411990: {
        annoAtto: "1990",
        dataAtto: "1990-08-07",
        numeroAtto: "241",
        tipoAttoUrn: "legge"
    },
    legge3921978: {
        annoAtto: "1978",
        dataAtto: "1978-07-27",
        numeroAtto: "392",
        tipoAttoUrn: "legge"
    },
    legge4311998: {
        annoAtto: "1998",
        dataAtto: "1998-12-09",
        numeroAtto: "431",
        tipoAttoUrn: "legge"
    },
    legge6041966: {
        annoAtto: "1966",
        dataAtto: "1966-07-15",
        numeroAtto: "604",
        tipoAttoUrn: "legge"
    }
};
function attoNormattivaConosciuto(riferimento, normalized) {
    const match = Object.values(ATTI_NORMATTIVA_CONOSCIUTI).find((atto) => atto.numeroAtto === riferimento.numeroAtto && atto.annoAtto === riferimento.annoAtto);
    if (match) {
        return match;
    }
    if (isCodiceCivileAlias(normalized)) {
        return ATTI_NORMATTIVA_CONOSCIUTI.codiceCivile;
    }
    if (isCodicePenaleAlias(normalized)) {
        return ATTI_NORMATTIVA_CONOSCIUTI.codicePenale;
    }
    if (isCodiceProceduraCivileAlias(normalized)) {
        return ATTI_NORMATTIVA_CONOSCIUTI.codiceProceduraCivile;
    }
    if (isCodiceProceduraPenaleAlias(normalized)) {
        return ATTI_NORMATTIVA_CONOSCIUTI.codiceProceduraPenale;
    }
    if (isCodiceProcessoAmministrativoAlias(normalized)) {
        return ATTI_NORMATTIVA_CONOSCIUTI.codiceProcessoAmministrativo;
    }
    if (isCodiceAmministrazioneDigitaleAlias(normalized)) {
        return ATTI_NORMATTIVA_CONOSCIUTI.codiceAmministrazioneDigitale;
    }
    if (isCodiceContrattiPubbliciAlias(normalized)) {
        return ATTI_NORMATTIVA_CONOSCIUTI.codiceContrattiPubblici;
    }
    if (isCodicePrivacyAlias(normalized)) {
        return ATTI_NORMATTIVA_CONOSCIUTI.codicePrivacy;
    }
    return undefined;
}
function creaUrnNormattiva(atto, articolo = atto.articolo) {
    const articoloSuffix = articolo
        ? `~art${articolo.replace(/[^0-9a-z-]/gi, "")}`
        : "";
    return `urn:nir:stato:${atto.tipoAttoUrn}:${atto.dataAtto};${atto.numeroAtto}${articoloSuffix}`;
}
function estraiUrnNormattivaDaTesto(input) {
    const urns = [];
    for (const match of input.matchAll(/urn:nir:stato:[^\s"'<>]+/gi)) {
        urns.push(pulisciUrnNormattiva(match[0]));
    }
    for (const match of input.matchAll(/https?:\/\/www\.normattiva\.it\/uri-res\/N2Ls\?([^\s"'<>]+)/gi)) {
        const query = decodeURIComponent(match[1]?.split("#", 1)[0] ?? "");
        if (query.startsWith("urn:nir:stato:")) {
            urns.push(pulisciUrnNormattiva(query));
        }
    }
    return urns;
}
function pulisciUrnNormattiva(value) {
    return value.replace(/[),.]+$/g, "");
}
function deduplicaUrnNormattiva(urns) {
    return [...new Set(urns.filter((urn) => urn.startsWith("urn:nir:stato:")))];
}
function tipoAttoNormattivaPerUrn(tipoAtto, normalized) {
    if (tipoAtto === "legge" || /\b(?:legge|l\.)\b/.test(normalized)) {
        return "legge";
    }
    if (tipoAtto === "decreto-legislativo" ||
        /\b(?:decreto legislativo|d\.?\s*lgs\.?|dlgs)\b/.test(normalized)) {
        return "decreto.legislativo";
    }
    if (tipoAtto === "decreto-legge" ||
        /\b(?:decreto legge|d\.?\s*l\.?|dl)\b/.test(normalized)) {
        return "decreto.legge";
    }
    if (tipoAtto === "decreto-presidente-repubblica" ||
        /\b(?:decreto del presidente della repubblica|d\.?\s*p\.?\s*r\.?|dpr)\b/.test(normalized)) {
        return "decreto.presidente.repubblica";
    }
    if (tipoAtto === "regolamento" || /\bregolamento\b/.test(normalized)) {
        return "regolamento";
    }
    return undefined;
}
function estraiDataAttoDaDomanda(normalized, annoAtto) {
    const iso = normalized.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (iso?.[1] === annoAtto) {
        return iso[0];
    }
    const slash = normalized.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
    if (slash?.[3] === annoAtto) {
        return `${slash[3]}-${slash[2]?.padStart(2, "0")}-${slash[1]?.padStart(2, "0")}`;
    }
    const mesi = {
        aprile: "04",
        agosto: "08",
        dicembre: "12",
        febbraio: "02",
        gennaio: "01",
        giugno: "06",
        luglio: "07",
        maggio: "05",
        marzo: "03",
        novembre: "11",
        ottobre: "10",
        settembre: "09"
    };
    const testuale = normalized.match(/\b(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})\b/);
    if (testuale?.[3] === annoAtto) {
        return `${testuale[3]}-${mesi[testuale[2] ?? ""]}-${testuale[1]?.padStart(2, "0")}`;
    }
    return undefined;
}
async function cercaDurataLocazioneDatabase(domanda, database) {
    if (!isDomandaSuDurataLocazione(normalizza(domanda))) {
        return [];
    }
    const result = (await database.query(`select id,
  testo,
  artefatto_fonte_id,
  citation_eli,
  citation_fonte,
  citation_tipo_atto,
  citation_numero_atto,
  citation_data_atto,
  citation_articolo,
  citation_comma,
  citation_vigenza_da,
  citation_vigenza_a,
  citation_url_fonte,
  1 as punteggio_semantico
from chunk_normativi
where citation_fonte = 'Normattiva'
  and (
    (citation_numero_atto = '431' and citation_articolo = '2')
    or (citation_numero_atto = '392' and citation_articolo in ('27', '28'))
  )
order by
  case citation_numero_atto when '431' then 0 else 1 end,
  citation_articolo,
  citation_comma nulls first
limit 8`));
    const tokensDomanda = tokenizza(domanda);
    return (result.rows ?? [])
        .map((row) => formattaRisultatoDatabase(row, domanda, tokensDomanda, {}))
        .sort((left, right) => right.punteggio - left.punteggio)
        .slice(0, 5);
}
function superaRilevanzaMinimaDatabase(resultItem, filtroStrutturato, riferimento, dominioGiuridico) {
    if (!dominioGiuridico) {
        return false;
    }
    if (riferimento.articolo || riferimento.comma) {
        return true;
    }
    if (filtroStrutturato) {
        return resultItem.punteggioLessicale >= 1 || resultItem.punteggioSemantico >= 0.35;
    }
    return (resultItem.punteggioLessicale >= 2 ||
        (resultItem.punteggioLessicale >= 1 && resultItem.punteggioSemantico >= 0.35));
}
function creaQueryChunkDatabase(embedding, riferimento) {
    const values = [toPgVector(embedding)];
    const where = ["embedding is not null"];
    aggiungiFiltriRiferimentoChunk(values, where, riferimento);
    return {
        filtroStrutturato: where.length > 1,
        text: `select id,
  testo,
  artefatto_fonte_id,
  citation_eli,
  citation_fonte,
  citation_tipo_atto,
  citation_numero_atto,
  citation_data_atto,
  citation_articolo,
  citation_comma,
  citation_vigenza_da,
  citation_vigenza_a,
  citation_url_fonte,
  1 - (embedding <=> $1::vector) as punteggio_semantico
from chunk_normativi
where ${where.join("\n  and ")}
order by embedding <=> $1::vector
limit 80`,
        values
    };
}
function creaQueryChunkDatabaseCompatibile(riferimento) {
    const values = [];
    const where = ["embedding is not null"];
    aggiungiFiltriRiferimentoChunk(values, where, riferimento);
    return {
        filtroStrutturato: where.length > 1,
        text: `select id,
  testo,
  embedding,
  artefatto_fonte_id,
  citation_eli,
  citation_fonte,
  citation_tipo_atto,
  citation_numero_atto,
  citation_data_atto,
  citation_articolo,
  citation_comma,
  citation_vigenza_da,
  citation_vigenza_a,
  citation_url_fonte,
  0 as punteggio_semantico
from chunk_normativi
where ${where.join("\n  and ")}
order by citation_fonte, citation_tipo_atto, citation_numero_atto, citation_articolo, citation_comma nulls first, id
limit 2000`,
        values
    };
}
function aggiungiFiltriRiferimentoChunk(values, where, riferimento) {
    if (riferimento?.fonte) {
        values.push(riferimento.fonte);
        where.push(`citation_fonte = $${values.length}`);
    }
    if (riferimento?.tipoAtto) {
        values.push(riferimento.tipoAtto);
        where.push(`citation_tipo_atto = $${values.length}`);
    }
    if (riferimento?.numeroAtto) {
        values.push(riferimento.numeroAtto);
        where.push(`citation_numero_atto = $${values.length}`);
    }
    if (riferimento?.annoAtto) {
        values.push(`${riferimento.annoAtto}-01-01`);
        where.push(`citation_data_atto >= $${values.length}::date`);
        values.push(`${Number(riferimento.annoAtto) + 1}-01-01`);
        where.push(`citation_data_atto < $${values.length}::date`);
    }
    if (riferimento?.articolo) {
        values.push(riferimento.articolo);
        where.push(`lower(citation_articolo) = lower($${values.length})`);
    }
    if (riferimento?.comma) {
        values.push(riferimento.comma);
        where.push(`lower(coalesce(citation_comma, '')) = lower($${values.length})`);
    }
}
function ordinaChunkCompatibiliPerEmbedding(rows, embeddingDomanda) {
    return rows
        .map((row) => ({
        ...row,
        punteggio_semantico: calcolaSimilaritaEmbeddingCompatibile(embeddingDomanda, row.embedding)
    }))
        .sort((left, right) => Number(right.punteggio_semantico ?? 0) - Number(left.punteggio_semantico ?? 0));
}
function calcolaSimilaritaEmbeddingCompatibile(embeddingDomanda, embeddingRow) {
    const embedding = parseEmbeddingCompatibile(embeddingRow);
    if (!embedding || embedding.length === 0) {
        return 0;
    }
    return Math.max(0, similaritaCoseno(embeddingDomanda, embedding));
}
function parseEmbeddingCompatibile(value) {
    if (Array.isArray(value)) {
        return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
    }
    if (typeof value !== "string") {
        return undefined;
    }
    const normalized = value.trim().replace(/^\[/, "").replace(/\]$/, "");
    if (!normalized) {
        return undefined;
    }
    const embedding = normalized.split(",").map((item) => Number(item.trim()));
    return embedding.every((item) => Number.isFinite(item)) ? embedding : undefined;
}
function formattaRisultatoDatabase(row, domanda, tokensDomanda, riferimento) {
    const metadati = citationMetadataFromRow(row);
    const testo = String(row.testo);
    const punteggioLessicale = calcolaPunteggioLessicale(domanda, tokensDomanda, testo, metadati, riferimento);
    const punteggioSemantico = Number(row.punteggio_semantico ?? 0);
    return {
        id: String(row.id),
        label: createCitationLabel(metadati),
        metadati,
        punteggio: Number((punteggioLessicale * 1.35 + punteggioSemantico * 6).toFixed(4)),
        punteggioLessicale,
        punteggioSemantico: Number(punteggioSemantico.toFixed(4)),
        testo,
        urlFonte: normalizzaUrlNormattiva(metadati.urlFonte)
    };
}
async function leggiFonteDaDatabase(id, env) {
    const database = await creaDatabaseDaEnv(env);
    try {
        const artifactResult = (await database.query(`select id, fonte, formato, sha256, url_fonte, dimensione_byte
from artefatti_fonte
where id = $1`, [id]));
        const artefatto = artifactResult.rows?.[0];
        if (!artefatto) {
            return {
                body: { errore: "Fonte non trovata nell'indice corrente." },
                status: 404
            };
        }
        const unitsResult = (await database.query(`select id,
  testo,
  artefatto_fonte_id,
  citation_eli,
  citation_fonte,
  citation_tipo_atto,
  citation_numero_atto,
  citation_data_atto,
  citation_articolo,
  citation_comma,
  citation_vigenza_da,
  citation_vigenza_a,
  citation_url_fonte
from chunk_normativi
where artefatto_fonte_id = $1
order by citation_articolo, citation_comma nulls first, id
limit 80`, [id]));
        const unita = (unitsResult.rows ?? []).map((row) => {
            const metadati = citationMetadataFromRow(row);
            return {
                eli: metadati.eli,
                etichetta: createCitationLabel(metadati),
                id: String(row.id),
                testo: String(row.testo)
            };
        });
        const riferimentiPerUnita = await leggiRiferimentiNormativiPerFonti(database, unita.map((item) => ({ eli: item.eli })));
        return {
            body: {
                artefatto: {
                    dimensioneByte: Number(artefatto.dimensione_byte),
                    fonte: String(artefatto.fonte),
                    formato: String(artefatto.formato),
                    id: String(artefatto.id),
                    sha256: String(artefatto.sha256),
                    urlFonte: normalizzaUrlNormattiva(String(artefatto.url_fonte)) ??
                        String(artefatto.url_fonte)
                },
                nomeFile: `Fonte ${String(artefatto.fonte)}`,
                riferimentiNormativi: deduplicaRiferimentiNormativi(unita.flatMap((item) => riferimentiPerUnita.get(item.eli) ?? [])),
                unita
            },
            status: 200
        };
    }
    finally {
        await database.end();
    }
}
function citationMetadataFromRow(row) {
    return {
        articolo: String(row.citation_articolo),
        comma: stringOrUndefined(row.citation_comma),
        dataAtto: dateString(row.citation_data_atto),
        eli: String(row.citation_eli),
        fonte: String(row.citation_fonte),
        idArtefattoFonte: stringOrUndefined(row.artefatto_fonte_id),
        numeroAtto: String(row.citation_numero_atto),
        tipoAtto: parseActType(row.citation_tipo_atto),
        urlFonte: normalizzaUrlNormattiva(stringOrUndefined(row.citation_url_fonte)),
        vigenzaA: optionalDateString(row.citation_vigenza_a),
        vigenzaDa: dateString(row.citation_vigenza_da)
    };
}
function calcolaPunteggioLessicale(domanda, tokensDomanda, testo, metadati, riferimento) {
    const tokensTesto = new Set(tokenizza(`${testo} ${metadati.articolo} ${metadati.comma ?? ""}`));
    let score = [...new Set(tokensDomanda)].reduce((total, token) => total + (tokensTesto.has(token) ? 1 : 0), 0);
    const normalizzata = normalizza(domanda);
    if (riferimento?.tipoAtto && metadati.tipoAtto === riferimento.tipoAtto) {
        score += 5;
    }
    if (riferimento?.fonte && metadati.fonte === riferimento.fonte) {
        score += 8;
    }
    if (riferimento?.numeroAtto && metadati.numeroAtto === riferimento.numeroAtto) {
        score += 12;
    }
    if (riferimento?.annoAtto && metadati.dataAtto.startsWith(riferimento.annoAtto)) {
        score += 10;
    }
    if (riferimento?.articolo && metadati.articolo.toLowerCase() === riferimento.articolo) {
        score += 16;
    }
    if (riferimento?.comma &&
        normalizzaComma(metadati.comma) === normalizzaComma(riferimento.comma)) {
        score += 12;
    }
    if (normalizzata.includes("motivazione") && metadati.articolo === "3") {
        score += 4;
    }
    if (normalizzata.includes("accesso civico") && metadati.articolo === "5") {
        score += 4;
    }
    if (normalizzata.includes("danno ingiusto") && metadati.articolo === "2043") {
        score += 5;
    }
    if (isDomandaSuApplicabilitaRegolamentoUe(normalizzata) &&
        metadati.tipoAtto === "trattato-ue" &&
        metadati.articolo === "288") {
        score += metadati.comma === "2" ? 18 : 8;
    }
    if (isDomandaSuImpugnazioneLicenziamento(normalizzata) &&
        metadati.tipoAtto === "legge" &&
        metadati.numeroAtto === "604" &&
        metadati.articolo === "6") {
        score += metadati.comma === "1" ? 20 : 16;
    }
    if (isDomandaSuIgnoranzaLeggePenale(normalizzata) &&
        metadati.numeroAtto === "1398" &&
        metadati.articolo === "5") {
        score += 24;
    }
    if (isDomandaSuDurataLocazione(normalizzata)) {
        if (metadati.numeroAtto === "431" && metadati.articolo === "2") {
            score += metadati.comma === "1" ? 24 : 20;
        }
        if (metadati.numeroAtto === "392" && metadati.articolo === "27") {
            score += normalizzata.includes("commercial") || normalizzata.includes("albergh")
                ? 24
                : 14;
        }
        if (metadati.numeroAtto === "392" && metadati.articolo === "28") {
            score += normalizzata.includes("rinnov") ? 18 : 10;
        }
    }
    if (riferimento?.fonte === "OpenGA - Giustizia Amministrativa" &&
        normalizzata.includes("silenzio") &&
        normalizza(testo).includes("silenzio")) {
        score += 12;
    }
    return score;
}
function estraiRiferimentoDomanda(domanda) {
    return estraiRiferimentiNormativiDomanda(domanda)[0] ?? {};
}
function estraiRiferimentiNormativiDomanda(domanda) {
    const normalized = normalizza(testoPerRiferimentiNormativi(domanda)).replace(/\s+/g, " ").trim();
    const articoli = estraiArticoliEspliciti(normalized);
    const comma = estraiComma(normalized);
    const atto = estraiAtto(normalized);
    const concetto = estraiConcettoNormativo(normalized);
    const base = {
        ...concetto,
        ...atto
    };
    if (articoli.length > 0) {
        return articoli.map((articolo) => ({
            ...base,
            articolo,
            comma: articoli.length === 1 ? comma ?? concetto.comma : undefined
        }));
    }
    const riferimento = {
        ...base,
        articolo: concetto.articolo,
        comma: comma ?? concetto.comma
    };
    return haRiferimentoNormativoAzionabile(riferimento) ? [riferimento] : [];
}
const SUFFISSO_NORMATIVO = "(?:bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies)";
const ARTICOLO_REGEX = new RegExp(`\\bart(?:icolo)?\\.?\\s+([0-9]+(?:\\s*[- ]?\\s*${SUFFISSO_NORMATIVO})?)\\b`);
const ARTICOLO_GLOBALE_REGEX = new RegExp(`\\bart(?:icolo)?\\.?\\s+([0-9]+(?:\\s*[- ]?\\s*${SUFFISSO_NORMATIVO})?)\\b`, "g");
const ARTICOLI_LISTA_REGEX = new RegExp(`\\bartt?\\.?\\s+([0-9]+(?:\\s*[- ]?\\s*${SUFFISSO_NORMATIVO})?(?:\\s*(?:,|e|ed)\\s*[0-9]+(?:\\s*[- ]?\\s*${SUFFISSO_NORMATIVO})?)*)\\b`, "g");
const NUMERO_ARTICOLO_REGEX = new RegExp(`[0-9]+(?:\\s*[- ]?\\s*${SUFFISSO_NORMATIVO})?`, "g");
const COMMA_REGEX = new RegExp(`\\b(?:comma|co\\.?)\\s+([0-9]+(?:\\s*[- ]?\\s*${SUFFISSO_NORMATIVO})?)\\b`);
function estraiArticolo(normalized) {
    const match = normalized.match(ARTICOLO_REGEX);
    return normalizzaIdentificatoreNormativo(match?.[1]);
}
function estraiArticoliEspliciti(normalized) {
    const articoli = [];
    for (const match of normalized.matchAll(ARTICOLO_GLOBALE_REGEX)) {
        articoli.push(match[1]);
    }
    for (const match of normalized.matchAll(ARTICOLI_LISTA_REGEX)) {
        for (const numero of (match[1] ?? "").matchAll(NUMERO_ARTICOLO_REGEX)) {
            articoli.push(numero[0]);
        }
    }
    return uniqueStrings(articoli.map((articolo) => normalizzaIdentificatoreNormativo(articolo)));
}
function estraiComma(normalized) {
    const match = normalized.match(COMMA_REGEX);
    return normalizzaIdentificatoreNormativo(match?.[1]);
}
function estraiAtto(normalized) {
    if (isCodiceCivileAlias(normalized)) {
        return {
            annoAtto: "1942",
            numeroAtto: "262"
        };
    }
    if (isCodiceProceduraPenaleAlias(normalized)) {
        return {
            annoAtto: "1988",
            numeroAtto: "447"
        };
    }
    if (isCodiceProceduraCivileAlias(normalized)) {
        return {
            annoAtto: "1940",
            numeroAtto: "1443"
        };
    }
    if (isCodicePenaleAlias(normalized)) {
        return {
            annoAtto: "1930",
            numeroAtto: "1398"
        };
    }
    if (isCodiceProcessoAmministrativoAlias(normalized)) {
        return {
            annoAtto: "2010",
            numeroAtto: "104",
            tipoAtto: "decreto-legislativo"
        };
    }
    if (isCodiceAmministrazioneDigitaleAlias(normalized)) {
        return {
            annoAtto: "2005",
            numeroAtto: "82",
            tipoAtto: "decreto-legislativo"
        };
    }
    if (isCodiceContrattiPubbliciAlias(normalized)) {
        return {
            annoAtto: "2023",
            numeroAtto: "36",
            tipoAtto: "decreto-legislativo"
        };
    }
    if (isCodicePrivacyAlias(normalized)) {
        return {
            annoAtto: "2003",
            numeroAtto: "196",
            tipoAtto: "decreto-legislativo"
        };
    }
    const leggeConDataTestuale = normalized.match(/\b(?:legge|l\.?)\s+\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+([0-9]{4})\s*,?\s*(?:n\.?\s*)?([0-9]+)\b/);
    if (leggeConDataTestuale?.[1] && leggeConDataTestuale[2]) {
        return {
            annoAtto: leggeConDataTestuale[1],
            numeroAtto: leggeConDataTestuale[2],
            tipoAtto: "legge"
        };
    }
    const patterns = [
        {
            regex: /\b(?:decreto\s+legislativo|d\s*\.?\s*lgs\s*\.?|dlgs)\s*(?:n\s*\.?\s*)?([0-9]+)\s*(?:\/|\s+|del(?:l'anno)?\s+)([0-9]{4})\b/,
            tipoAtto: "decreto-legislativo"
        },
        {
            regex: /\b(?:decreto\s+legge|d\s*\.?\s*l\s*\.?|dl)\s*(?:n\s*\.?\s*)?([0-9]+)\s*(?:\/|\s+|del(?:l'anno)?\s+)([0-9]{4})\b/,
            tipoAtto: "decreto-legge"
        },
        {
            regex: /\b(?:decreto\s+del\s+presidente\s+della\s+repubblica|d\s*\.?\s*p\s*\.?\s*r\s*\.?|dpr)\s*(?:n\s*\.?\s*)?([0-9]+)\s*(?:\/|\s+|del(?:l'anno)?\s+)([0-9]{4})\b/,
            tipoAtto: "decreto-presidente-repubblica"
        },
        {
            regex: /\b(?:legge|l\s*\.?)\s*(?:n\s*\.?\s*)?([0-9]+)\s*(?:\/|\s+|del(?:l'anno)?\s+)([0-9]{4})\b/,
            tipoAtto: "legge"
        },
        {
            regex: /\b(?:regolamento)\s*(?:n\s*\.?\s*)?([0-9]+)\s*(?:\/|\s+|del(?:l'anno)?\s+)([0-9]{4})\b/,
            tipoAtto: "regolamento"
        },
        {
            regex: /\b(?:regio\s+decreto|r\s*\.?\s*d\s*\.?|atto|altro)\s*(?:n\s*\.?\s*)?([0-9]+)\s*(?:\/|\s+|del(?:l'anno)?\s+)([0-9]{4})\b/
        }
    ];
    for (const pattern of patterns) {
        const match = normalized.match(pattern.regex);
        if (match?.[1] && match[2]) {
            return {
                annoAtto: match[2],
                numeroAtto: match[1],
                tipoAtto: pattern.tipoAtto
            };
        }
    }
    return {};
}
function estraiConcettoNormativo(normalized) {
    if (isDomandaSuGazzettaUfficiale(normalized)) {
        return {
            fonte: "Gazzetta Ufficiale"
        };
    }
    if (isDomandaSuGiurisprudenzaAperta(normalized)) {
        return {
            fonte: "OpenGA - Giustizia Amministrativa"
        };
    }
    if (normalized.includes("motivazione") &&
        (normalized.includes("provvedimento") ||
            normalized.includes("procedimento") ||
            normalized.includes("amministrativ"))) {
        return {
            annoAtto: "1990",
            articolo: "3",
            numeroAtto: "241",
            tipoAtto: "legge"
        };
    }
    if (normalized.includes("princip") &&
        (normalized.includes("attivita amministrativa") ||
            normalized.includes("procedimento amministrativo"))) {
        return {
            annoAtto: "1990",
            articolo: "1",
            numeroAtto: "241",
            tipoAtto: "legge"
        };
    }
    if ((normalized.includes("legge 241") ||
        normalized.includes("l 241") ||
        normalized.includes("procedimento amministrativo")) &&
        (normalized.includes("procedimento") || normalized.includes("legge 241"))) {
        return {
            annoAtto: "1990",
            numeroAtto: "241",
            tipoAtto: "legge"
        };
    }
    if (normalized.includes("accesso civico")) {
        return {
            annoAtto: "2013",
            articolo: normalized.includes("limit") ? "5-bis" : "5",
            numeroAtto: "33",
            tipoAtto: "decreto-legislativo"
        };
    }
    if (normalized.includes("danno ingiusto")) {
        return {
            annoAtto: "1942",
            articolo: "2043",
            numeroAtto: "262"
        };
    }
    if (normalized.includes("onere della prova") || normalized.includes("onere probatorio")) {
        return {
            annoAtto: "1942",
            articolo: "2697",
            numeroAtto: "262"
        };
    }
    if (isDomandaSuClausoleVessatorie(normalized)) {
        return {
            annoAtto: "1942",
            articolo: normalized.includes("formular") || normalized.includes("modul") ? "1342" : "1341",
            comma: normalized.includes("comma 2") || normalized.includes("comma secondo") ? "2" : undefined,
            numeroAtto: "262"
        };
    }
    if (isDomandaSuIgnoranzaLeggePenale(normalized)) {
        return {
            annoAtto: "1930",
            articolo: "5",
            numeroAtto: "1398"
        };
    }
    if (isDomandaSuApplicabilitaRegolamentoUe(normalized)) {
        return {
            annoAtto: "2016",
            articolo: "288",
            comma: "2",
            numeroAtto: "12016E288",
            tipoAtto: "trattato-ue"
        };
    }
    if (isDomandaSuImpugnazioneLicenziamento(normalized)) {
        return {
            annoAtto: "1966",
            articolo: "6",
            numeroAtto: "604",
            tipoAtto: "legge"
        };
    }
    return {};
}
function isDomandaSuGazzettaUfficiale(normalized) {
    return (normalized.includes("gazzetta ufficiale") ||
        normalized.includes("pubblicazione in gazzetta") ||
        normalized.includes("pubblicata in gazzetta"));
}
function isDomandaSuGiurisprudenzaAperta(normalized) {
    return (normalized.includes("openga") ||
        normalized.includes("giurisprudenza") ||
        normalized.includes("orientamento del tar") ||
        normalized.includes("orientamenti del tar") ||
        normalized.includes("sentenza tar") ||
        normalized.includes("sentenze tar") ||
        normalized.includes("silenzio p.a") ||
        normalized.includes("silenzio pa") ||
        normalized.includes("silenzio amministrativo") ||
        normalized.includes("consiglio di stato"));
}
function isCodiceCivileAlias(normalized) {
    return (/\bcodice\s+civile\b/.test(normalized) ||
        /\bcod\.?\s*civ\.?\b/.test(normalized) ||
        /(?:^|[^a-z0-9])c\s*\.?\s*c\s*\.?(?=$|[^a-z0-9])/.test(normalized));
}
function isCodicePenaleAlias(normalized) {
    return (/\bcodice\s+penale\b/.test(normalized) ||
        /\bcod\.?\s*pen\.?\b/.test(normalized) ||
        /(?:^|[^a-z0-9])c\s*\.?\s*p\s*\.?(?!\s*\.?\s*[cp])(?=$|[^a-z0-9])/.test(normalized));
}
function isCodiceProceduraCivileAlias(normalized) {
    return (/\bcodice\s+(?:di\s+)?procedura\s+civile\b/.test(normalized) ||
        /\bcod\.?\s*proc\.?\s*civ\.?\b/.test(normalized) ||
        /(?:^|[^a-z0-9])c\s*\.?\s*p\s*\.?\s*c\s*\.?(?=$|[^a-z0-9])/.test(normalized));
}
function isCodiceProceduraPenaleAlias(normalized) {
    return (/\bcodice\s+(?:di\s+)?procedura\s+penale\b/.test(normalized) ||
        /\bcod\.?\s*proc\.?\s*pen\.?\b/.test(normalized) ||
        /(?:^|[^a-z0-9])c\s*\.?\s*p\s*\.?\s*p\s*\.?(?=$|[^a-z0-9])/.test(normalized));
}
function isCodiceProcessoAmministrativoAlias(normalized) {
    return (/\bcodice\s+(?:del\s+)?processo\s+amministrativo\b/.test(normalized) ||
        /(?:^|[^a-z0-9])c\s*\.?\s*p\s*\.?\s*a\s*\.?(?=$|[^a-z0-9])/.test(normalized));
}
function isCodiceAmministrazioneDigitaleAlias(normalized) {
    return /\bcodice\s+(?:dell'?|della\s+)?amministrazione\s+digitale\b|\bcad\b/.test(normalized);
}
function isCodiceContrattiPubbliciAlias(normalized) {
    return (/\bcodice\s+(?:dei\s+)?contratti\s+pubblici\b/.test(normalized) ||
        normalized.includes("appalti pubblici") ||
        normalized.includes("contratti pubblici"));
}
function isCodicePrivacyAlias(normalized) {
    return (/\bcodice\s+(?:in\s+materia\s+di\s+protezione\s+dei\s+dati\s+personali|privacy)\b/.test(normalized) ||
        normalized.includes("protezione dati personali"));
}
function isDomandaSuClausoleVessatorie(normalized) {
    return ((normalized.includes("clausol") &&
        (normalized.includes("vessator") ||
            normalized.includes("specifica approvazione") ||
            normalized.includes("approvazione per iscritto") ||
            normalized.includes("condizioni generali"))) ||
        normalized.includes("recesso unilaterale") ||
        normalized.includes("facolta di recedere") ||
        normalized.includes("facoltà di recedere") ||
        normalized.includes("limitazione di responsabilita") ||
        normalized.includes("limitazioni di responsabilita") ||
        normalized.includes("deroga alla competenza") ||
        normalized.includes("tacita proroga") ||
        normalized.includes("decadenze a carico"));
}
function isDomandaSuFunzioneRiferimentiIncrociati(normalized) {
    const chiedeCapacita = normalized.includes("puoi") ||
        normalized.includes("riesci") ||
        normalized.includes("trasform") ||
        normalized.includes("collegamento consultabile") ||
        normalized.includes("collegamenti consultabili") ||
        normalized.includes("link") ||
        normalized.includes("funziona");
    const parlaDiRimandi = normalized.includes("riferimenti incrociati") ||
        normalized.includes("rimando") ||
        normalized.includes("rimandi") ||
        normalized.includes("rinvio") ||
        normalized.includes("rinvii") ||
        normalized.includes("cita un") ||
        normalized.includes("altra legge") ||
        normalized.includes("regolamento europeo") ||
        normalized.includes("regolamento ue") ||
        normalized.includes("normativa europea");
    return chiedeCapacita && parlaDiRimandi;
}
function isDomandaSuApplicabilitaRegolamentoUe(normalized) {
    return (normalized.includes("regolamento") &&
        (normalized.includes("ue") ||
            normalized.includes("unione europea") ||
            normalized.includes("tfue") ||
            normalized.includes("stati membri")) &&
        (normalized.includes("applicabile") ||
            normalized.includes("direttamente") ||
            normalized.includes("portata generale")));
}
function isDomandaSuImpugnazioneLicenziamento(normalized) {
    return (normalized.includes("licenziament") &&
        (normalized.includes("impugn") ||
            normalized.includes("entro quanto") ||
            normalized.includes("entro quando") ||
            normalized.includes("termine") ||
            normalized.includes("termini") ||
            normalized.includes("giorni") ||
            normalized.includes("decadenza") ||
            normalized.includes("contestare")));
}
function isDomandaSuIgnoranzaLeggePenale(normalized) {
    return (normalized.includes("la legge non ammette ignoranza") ||
        normalized.includes("ignorantia legis") ||
        ((normalized.includes("ignoranza") || normalized.includes("ignorare")) &&
            (normalized.includes("legge") ||
                normalized.includes("penale") ||
                normalized.includes("scusa"))));
}
function isDomandaSuDurataLocazione(normalized) {
    const parlaDiLocazione = normalized.includes("locazione") ||
        normalized.includes("locazioni") ||
        normalized.includes("affitto") ||
        normalized.includes("affitti") ||
        normalized.includes("contratto di casa") ||
        normalized.includes("contratto casa") ||
        normalized.includes("canone concordato");
    const chiedeDurata = normalized.includes("quanto dura") ||
        normalized.includes("durata") ||
        normalized.includes("anni") ||
        normalized.includes("scadenza") ||
        normalized.includes("rinnovo") ||
        normalized.includes("rinnov");
    return parlaDiLocazione && chiedeDurata;
}
function normalizzaIdentificatoreNormativo(value) {
    return value?.replace(/\s*-\s*/g, "-").replace(/\s+/g, "-").toLowerCase();
}
function normalizzaComma(value) {
    return normalizzaIdentificatoreNormativo(value);
}
function calcolaCoperturaCitazioni(fonti) {
    if (fonti.length === 0) {
        return 0;
    }
    const citabili = fonti.filter((fonte) => fonte.urlFonte || fonte.metadati.idArtefattoFonte);
    return Number((citabili.length / fonti.length).toFixed(2));
}
function richiedeRevisioneUmana(domanda) {
    const normalized = normalizza(domanda);
    return [
        "penale",
        "reato",
        "licenziamento",
        "risarcimento",
        "danno",
        "impugnare",
        "locazione",
        "affitto",
        "responsabilita",
        "contratto",
        "appalto"
    ].some((token) => normalized.includes(token));
}
function verificaAccessoOperatore(env, adminToken) {
    const expected = env.ADMIN_API_KEY?.trim();
    if (!expected) {
        return { ok: true };
    }
    if (adminToken && adminToken === expected) {
        return { ok: true };
    }
    return {
        ok: false,
        result: {
            body: { errore: "Accesso operatore non autorizzato." },
            status: 401
        }
    };
}
function parseStatoReview(value) {
    if (value === "in_attesa" ||
        value === "in_review" ||
        value === "approvata" ||
        value === "respinta" ||
        value === "superata") {
        return value;
    }
    return undefined;
}
function sanitizeFileName(value) {
    const cleaned = value.replace(/[/\\:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
    return cleaned.length > 0 ? cleaned.slice(0, 160) : "documento";
}
function creaAnteprimaDocumento(buffer, contentType) {
    const isText = contentType.startsWith("text/") ||
        contentType.includes("json") ||
        contentType.includes("xml");
    if (!isText) {
        return null;
    }
    return buffer.toString("utf8").replace(/\s+/g, " ").trim().slice(0, 4000);
}
const STOP_WORDS = new Set([
    "che",
    "chi",
    "con",
    "dei",
    "del",
    "della",
    "gli",
    "per",
    "una",
    "uno"
]);
const SEGNALI_GIURIDICI = new Set([
    "accesso",
    "amministrativa",
    "amministrativo",
    "anticorruzione",
    "affitto",
    "affitti",
    "articolo",
    "atto",
    "civico",
    "codice",
    "comma",
    "concorrenza",
    "contratti",
    "contratto",
    "contribuente",
    "corruzione",
    "danno",
    "dati",
    "decreto",
    "decisione",
    "direttamente",
    "direttiva",
    "digitale",
    "diritti",
    "diritto",
    "enti",
    "europea",
    "europeo",
    "eur",
    "giurisdizione",
    "impiego",
    "lavoratori",
    "lavoro",
    "legge",
    "locazione",
    "locazioni",
    "motivazione",
    "norma",
    "normativa",
    "obblighi",
    "penale",
    "procedimento",
    "prova",
    "provvedimento",
    "pubblici",
    "pubblico",
    "pubblicita",
    "regolamento",
    "responsabilita",
    "ricorso",
    "sanzioni",
    "segnalazioni",
    "sicurezza",
    "stati",
    "tfue",
    "trattato",
    "trasparenza",
    "ue",
    "unione",
    "vigenza",
    "whistleblowing"
]);
function tokenizza(input) {
    return normalizza(input)
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}
function haSegnaliGiuridici(tokens) {
    return tokens.some((token) => SEGNALI_GIURIDICI.has(token));
}
function uniqueStrings(values) {
    return [...new Set(values.filter((value) => Boolean(value)))];
}
function normalizza(input) {
    return input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
function testoPerRiferimentiNormativi(domanda) {
    const [primaDelDocumento] = domanda.split(/\n\s*(?:fascicolo allegato|documento allegato|riepilogo documento|clausole rilevanti|riferimenti individuati nel documento)\b/i);
    const candidate = primaDelDocumento?.trim();
    if (candidate && haSegnaliRiferimentoNormativo(candidate)) {
        return candidate;
    }
    return domanda;
}
function haSegnaliRiferimentoNormativo(value) {
    const normalized = normalizza(value);
    return (/\bartt?\.?\s+[0-9]/.test(normalized) ||
        /\barticolo\s+[0-9]/.test(normalized) ||
        /\bcodice\b/.test(normalized) ||
        /(?:^|[^a-z0-9])c\s*\.?\s*[cp]\s*\.?/.test(normalized) ||
        /\b(?:legge|l\.?|d\.?\s*lgs\.?|d\.?\s*p\.?\s*r\.?|dpr|decreto)\b/.test(normalized));
}
function hashBreve(value) {
    return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 12);
}
function toPgVector(values) {
    return `[${values.map((value) => Number(value.toFixed(8))).join(",")}]`;
}
function parseActType(value) {
    const normalized = String(value);
    if (normalized === "legge" ||
        normalized === "decreto-legge" ||
        normalized === "decreto-legislativo" ||
        normalized === "decreto-presidente-repubblica" ||
        normalized === "regio-decreto" ||
        normalized === "codice" ||
        normalized === "regolamento" ||
        normalized === "trattato-ue") {
        return normalized;
    }
    return "altro";
}
function dateString(value) {
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
}
function optionalDateString(value) {
    if (value === null || value === undefined) {
        return undefined;
    }
    return dateString(value);
}
function stringOrUndefined(value) {
    return typeof value === "string" && value.length > 0 ? value : undefined;
}
function isMissingReferenceGraphError(error) {
    if (!error || typeof error !== "object") {
        return false;
    }
    const record = error;
    return (record.code === "42P01" ||
        record.code === "42703" ||
        String(record.message ?? "").includes("riferimenti_normativi"));
}
function normalizzaUrlNormattiva(value) {
    const prefix = "https://www.normattiva.it/uri-res/N2Ls?";
    if (!value?.startsWith(prefix)) {
        return value;
    }
    const [baseAndQuery, fragment] = value.split("#", 2);
    const encodedUrn = baseAndQuery?.slice(prefix.length);
    if (!encodedUrn?.startsWith("urn%3A")) {
        return value;
    }
    return `${prefix}${decodeURIComponent(encodedUrn)}${fragment ? `#${fragment}` : ""}`;
}
