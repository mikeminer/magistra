import { createHash, randomUUID } from "node:crypto";
import { request } from "node:https";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { PostgresIngestJobRepository, PostgresLegalRepository, comandoUpsertSourcePolicyApproval, comandoUpsertSourceCatalog, contaSnapshotDatabase, creaSnapshotDatabase } from "../../database/dist/index.js";
import { aggregaCorporaNormativi, archiviaFontiCorpus, CODICE_PENALE_ART_5_SOURCE_URL, creaArchiviazioneOggettiDaEnv, LEGGE_392_ART_27_SOURCE_URL, LEGGE_431_ART_2_SOURCE_URL, NORMATTIVA_CODICE_PENALE_ESEMPIO_XML, NORMATTIVA_LEGGE_392_ESEMPIO_XML, NORMATTIVA_LEGGE_431_ESEMPIO_XML, parseCorpusEurLexBase, parseCorpusNormattivaEsempio, parseDocumentiAkomaNtoso } from "../../ingest/dist/index.js";
import { creaEmbeddingProviderDaEnv } from "../../llm/dist/index.js";
import { GazzettaUfficialeAdapter, GiurisprudenzaApertaAdapter, NormattivaAdapter, creaUrlNormattivaDaUrn, fontiCatalogabili, scaricaAttoNormattivaOpenData, scaricaDocumentoAkomaNtoso } from "../../sources/dist/index.js";
import { creaDatabaseDaEnv, databaseConfigurato } from "./status.js";
export { creaDatabaseDaEnv, databaseConfigurato, databaseDriverDaEnv, isPgliteDatabase, leggiStatoIngest, leggiStatoIngestDaEnv, normalizzaSqlPerPglite } from "./status.js";
const GAZZETTA_LEGGE_241_URL = "https://www.gazzettaufficiale.it/eli/id/1990/08/18/090G0294/sq";
const GAZZETTA_LEGGE_241_FALLBACK_XML = `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="legge">
    <meta>
      <identification source="#gazzetta-ufficiale">
        <FRBRWork>
          <FRBRthis value="/eli/gu/1990/08/18/090G0294/sg" />
          <FRBRdate date="1990-08-07" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="241" />
          <FRBRname value="legge" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/eli/gu/1990/08/18/090G0294/sg/ita@1990-08-18" />
          <FRBRdate date="1990-08-18" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>Legge 7 agosto 1990, n. 241 - pubblicazione in Gazzetta Ufficiale</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_1">
        <num>Art. 1</num>
        <heading>Pubblicazione in Gazzetta Ufficiale</heading>
        <paragraph eId="art_1__para_1">
          <num>1.</num>
          <content>
            <p>Pubblicazione in Gazzetta Ufficiale della legge 241 del 07-08-1990. Titolo: Nuove norme in materia di procedimento amministrativo e di diritto di accesso ai documenti amministrativi. Riferimento ufficiale: GU Serie Generale n.192 del 18-08-1990. Data di pubblicazione: 18-08-1990.</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
const OPENGA_SENTENZE_SILENZIO_PA_URL = "https://openga.giustizia-amministrativa.it/dataset/2e6def68-e725-4a84-9bcd-7bb2d95f17ce/resource/1c537853-530c-409f-83d3-c43051bce5de/download/tar-valle-daosta-sentenze-2024.csv";
const OPENGA_HOSTNAME = "openga.giustizia-amministrativa.it";
export async function eseguiIngestNormattivaLocale(options = {}) {
    const env = options.env ?? process.env;
    const database = options.database ?? (databaseConfigurato(env) ? await creaDatabaseDaEnv(env) : undefined);
    const jobId = options.jobId ?? `ingest:${new Date().toISOString()}:${randomUUID()}`;
    const jobRepository = database ? new PostgresIngestJobRepository(database) : undefined;
    if (database && options.migraPrima !== false) {
        await applicaMigrazioni(database, env);
    }
    const dettagliSorgenti = leggiDettagliSorgentiNormattivaEnv(env);
    await jobRepository?.iniziaJob({
        dettagli: {
            ...dettagliSorgenti,
            worker: "@italian-oss-legal-platform/worker"
        },
        fonte: "Normattiva",
        id: jobId
    });
    try {
        const sorgentiNormattiva = await leggiSorgentiNormattiva(env);
        const embeddingProvider = creaEmbeddingProviderDaEnv(env);
        const corpus = await caricaCorpusNormattiva(sorgentiNormattiva, env, options.fetch);
        const chunks = await Promise.all(corpus.chunks.map(async (chunk) => ({
            ...chunk,
            embedding: chunk.embedding ?? (await embeddingProvider.generaEmbedding(chunk.testo))
        })));
        const corpusConEmbedding = {
            ...corpus,
            chunks
        };
        const storage = creaArchiviazioneOggettiDaEnv(env);
        const artefatti = await archiviaFontiCorpus(corpusConEmbedding, storage);
        const snapshot = creaSnapshotDatabase(corpusConEmbedding);
        const conteggi = contaSnapshotDatabase(snapshot);
        const importaDatabase = options.importaDatabase ?? Boolean(database);
        const sostituisciCorpus = env.WORKER_REPLACE_CORPUS === "true";
        if (database && importaDatabase) {
            await registraCatalogoFonti(database);
            await registraApprovazioniPolicyFonti(database);
            if (sostituisciCorpus) {
                await pulisciCorpusNormativo(database);
            }
            await new PostgresLegalRepository(database).upsertSnapshot(snapshot);
            await registraSourceRuns(database, jobId, corpusConEmbedding.documentiFonte, artefatti);
            await registraVerificheOperativeFonti(database, jobId, env, options.fetch);
        }
        await jobRepository?.completaJob({
            conteggi: { ...conteggi },
            dettagli: {
                artefattiArchiviati: artefatti.length,
                corpusSostituito: sostituisciCorpus,
                providerEmbedding: embeddingProvider.nome,
                sorgenti: sorgentiNormattiva
            },
            id: jobId
        });
        return {
            artefattiArchiviati: artefatti.length,
            conteggi,
            corpusSostituito: Boolean(database && importaDatabase && sostituisciCorpus),
            importatoSuDatabase: Boolean(database && importaDatabase),
            jobId,
            providerEmbedding: embeddingProvider.nome
        };
    }
    catch (error) {
        await jobRepository?.fallisceJob({
            errore: error instanceof Error ? error.message : "Errore ingest non gestito.",
            id: jobId
        });
        throw error;
    }
    finally {
        if (!options.database && database && "end" in database && typeof database.end === "function") {
            await database.end();
        }
    }
}
export async function eseguiSchedulerIngest(options = {}) {
    const env = options.env ?? process.env;
    const intervalloSecondi = leggiIntervalloScheduler(env);
    const eseguiUnaVolta = env.WORKER_RUN_ONCE === "true" || env.WORKER_SCHEDULER_RUN_ONCE === "true";
    let esecuzioni = 0;
    let ultimoRisultato;
    while (!options.signal?.aborted) {
        ultimoRisultato = await eseguiIngestNormattivaLocale({
            ...options,
            jobId: options.jobId ?? undefined
        });
        esecuzioni += 1;
        if (eseguiUnaVolta) {
            break;
        }
        await sleep(intervalloSecondi * 1000, options.signal);
    }
    return {
        esecuzioni,
        intervalloSecondi,
        ultimoJobId: ultimoRisultato?.jobId,
        ultimoRisultato
    };
}
export async function eseguiRecuperoOnlineNormattiva(urns, options = {}) {
    const env = options.env ?? process.env;
    if (!databaseConfigurato(env)) {
        throw new Error("Database non configurato: impossibile importare fonti online.");
    }
    const database = options.database ?? (await creaDatabaseDaEnv(env));
    const jobId = options.jobId ?? `online-recovery:${new Date().toISOString()}:${randomUUID()}`;
    const jobRepository = new PostgresIngestJobRepository(database);
    const urnsUniche = deduplicaValori(urns);
    if (urnsUniche.length === 0) {
        throw new Error("Nessun URN Normattiva indicato per il recupero online.");
    }
    if (options.migraPrima === true) {
        await applicaMigrazioni(database, env);
    }
    await jobRepository.iniziaJob({
        dettagli: {
            modalita: "online-recovery",
            urns: urnsUniche,
            worker: "@italian-oss-legal-platform/worker"
        },
        fonte: "Normattiva",
        id: jobId
    });
    try {
        const adapter = new NormattivaAdapter();
        const documenti = [];
        for (const urn of urnsUniche) {
            const scaricato = await scaricaAttoNormattivaOpenData(adapter, urn, options.fetch);
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
        const artefatti = await archiviaFontiCorpus(corpusConEmbedding, storage);
        const snapshot = creaSnapshotDatabase(corpusConEmbedding);
        const conteggi = contaSnapshotDatabase(snapshot);
        if (options.importaDatabase ?? true) {
            await registraCatalogoFonti(database);
            await registraApprovazioniPolicyFonti(database);
            await new PostgresLegalRepository(database).upsertSnapshot(snapshot);
            await registraSourceRuns(database, jobId, corpusConEmbedding.documentiFonte, artefatti);
        }
        await jobRepository.completaJob({
            conteggi: { ...conteggi },
            dettagli: {
                artefattiArchiviati: artefatti.length,
                modalita: "online-recovery",
                providerEmbedding: embeddingProvider.nome,
                urns: urnsUniche
            },
            id: jobId
        });
        return {
            artefattiArchiviati: artefatti.length,
            chunkNormativi: conteggi.chunk_normativi,
            conteggi,
            importatoSuDatabase: Boolean(options.importaDatabase ?? true),
            jobId,
            providerEmbedding: embeddingProvider.nome,
            urns: urnsUniche
        };
    }
    catch (error) {
        await jobRepository.fallisceJob({
            errore: error instanceof Error ? error.message : "Recupero online non gestito.",
            id: jobId
        });
        throw error;
    }
    finally {
        if (!options.database && database && "end" in database && typeof database.end === "function") {
            await database.end();
        }
    }
}
export async function applicaMigrazioni(database, env = process.env) {
    const migrationsDir = resolve(env.DATABASE_MIGRATIONS_DIR ?? "packages/database/migrations");
    const files = (await readdir(migrationsDir))
        .filter((file) => file.endsWith(".sql"))
        .sort();
    const applied = [];
    await database.query(`create table if not exists schema_migrations (
  id text primary key,
  applied_at timestamptz not null default now()
)`);
    for (const file of files) {
        const exists = await migrationApplicata(database, file);
        if (exists) {
            continue;
        }
        const sql = await readFile(join(migrationsDir, file), "utf8");
        await database.query("begin");
        try {
            await database.query(sql);
            await database.query("insert into schema_migrations (id) values ($1)", [file]);
            await database.query("commit");
            applied.push(file);
        }
        catch (error) {
            await database.query("rollback");
            throw error;
        }
    }
    return applied;
}
async function caricaCorpusNormattiva(sorgenti, env, fetchImpl) {
    if (sorgenti.urls.length === 0 && sorgenti.documentiManifesto.length === 0) {
        return await aggiungiCorporaBase(parseCorpusNormattivaEsempio(), env, fetchImpl);
    }
    const adapter = new NormattivaAdapter();
    const documentiDaUrl = await Promise.all(sorgenti.urls.map((url) => scaricaFonteConRetry(env, `URL Normattiva ${url}`, () => scaricaDocumentoAkomaNtoso(adapter, url, fetchImpl))));
    const documentiManifesto = await scaricaDocumentiDaManifesto(adapter, sorgenti.documentiManifesto, env, fetchImpl);
    const documenti = [
        ...documentiDaUrl.map((documento) => ({
            fonte: documento.fonte.nome,
            sourceUrl: documento.sourceUrl,
            xml: documento.xml
        })),
        ...documentiManifesto,
        ...creaSupplementiNormattivaLocali(sorgenti, env)
    ];
    if (documenti.length === 0) {
        return await aggiungiCorporaBase(parseCorpusNormattivaEsempio(), env, fetchImpl);
    }
    return await aggiungiCorporaBase(parseDocumentiAkomaNtoso(documenti), env, fetchImpl);
}
function creaSupplementiNormattivaLocali(sorgenti, env) {
    const flag = env.NORMATTIVA_LOCAL_SUPPLEMENTS_ENABLED;
    const deveIntegrare = flag === "true" ||
        (flag !== "false" && sorgenti.manifestId?.includes("produzione"));
    if (!deveIntegrare) {
        return [];
    }
    return [
        {
            artifactId: "normattiva:r-d-1398-1930:articolo-5-supplemento",
            fonte: "Normattiva",
            sourceUrl: CODICE_PENALE_ART_5_SOURCE_URL,
            stato: "vigente",
            xml: NORMATTIVA_CODICE_PENALE_ESEMPIO_XML
        },
        {
            artifactId: "normattiva:l-431-1998:articolo-2-supplemento",
            fonte: "Normattiva",
            sourceUrl: LEGGE_431_ART_2_SOURCE_URL,
            stato: "vigente",
            xml: NORMATTIVA_LEGGE_431_ESEMPIO_XML
        },
        {
            artifactId: "normattiva:l-392-1978:articolo-27-supplemento",
            fonte: "Normattiva",
            sourceUrl: LEGGE_392_ART_27_SOURCE_URL,
            stato: "vigente",
            xml: NORMATTIVA_LEGGE_392_ESEMPIO_XML
        }
    ];
}
async function aggiungiCorporaBase(corpus, env, fetchImpl) {
    const corpora = [corpus];
    if (env.EURLEX_BASE_CORPUS_ENABLED !== "false") {
        corpora.push(parseCorpusEurLexBase());
    }
    const corpusConGazzetta = await aggiungiCorpusBaseGazzetta(corpora, env, fetchImpl);
    return await aggiungiCorpusBaseOpenGa([corpusConGazzetta], env, fetchImpl);
}
async function aggiungiCorpusBaseGazzetta(corpora, env, fetchImpl = fetch) {
    if (env.GAZZETTA_BASE_CORPUS_ENABLED !== "true") {
        return aggregaCorporaNormativi(corpora);
    }
    try {
        const documenti = await scaricaDocumentiGazzettaBase(env, fetchImpl);
        if (documenti.length > 0) {
            corpora.push(parseDocumentiAkomaNtoso(documenti));
        }
    }
    catch (error) {
        const fallback = creaFallbackGazzetta(env);
        if (fallback.length > 0) {
            corpora.push(parseDocumentiAkomaNtoso(fallback));
            return aggregaCorporaNormativi(corpora);
        }
        if (env.GAZZETTA_BASE_CORPUS_REQUIRED === "true") {
            throw error;
        }
    }
    return aggregaCorporaNormativi(corpora);
}
function creaFallbackGazzetta(env) {
    if (env.GAZZETTA_LOCAL_FALLBACK_ENABLED === "false") {
        return [];
    }
    return [
        {
            artifactId: "gazzetta:090G0294:fallback",
            fonte: "Gazzetta Ufficiale",
            sourceUrl: GAZZETTA_LEGGE_241_URL,
            stato: "originaria",
            xml: GAZZETTA_LEGGE_241_FALLBACK_XML
        }
    ];
}
async function scaricaDocumentiGazzettaBase(env, fetchImpl) {
    const urls = (env.GAZZETTA_BASE_CORPUS_URLS ?? GAZZETTA_LEGGE_241_URL)
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
    const adapter = new GazzettaUfficialeAdapter();
    const documenti = [];
    for (const url of urls) {
        const response = await fetchImpl(url, {
            headers: {
                accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
                "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
            },
            method: "GET"
        });
        if (!response.ok) {
            throw new Error(`Download Gazzetta Ufficiale fallito (${response.status} ${response.statusText}): ${url}`);
        }
        const html = await response.text();
        documenti.push({
            artifactId: `gazzetta:${estraiMetaHtml(html, "eli:id_local") ?? hashBreve(url)}`,
            fonte: adapter.fonte.nome,
            sourceUrl: url,
            stato: "originaria",
            xml: convertiGazzettaHtmlInAkomaNtoso(html, url)
        });
    }
    return documenti;
}
function convertiGazzettaHtmlInAkomaNtoso(html, sourceUrl) {
    const idLocale = estraiMetaHtml(html, "eli:id_local") ?? hashBreve(sourceUrl);
    const dataAtto = estraiMetaHtml(html, "eli:date_document") ?? "1990-08-07";
    const dataPubblicazione = estraiMetaHtml(html, "eli:date_publication") ?? dataAtto;
    const titolo = estraiTestoProprietaHtml(html, "eli:title") ??
        "Atto pubblicato in Gazzetta Ufficiale";
    const tipoDocumento = normalizzaTipoGazzetta(estraiResourceFinaleMetaHtml(html, "eli:type_document") ?? "legge");
    const numero = estraiNumeroAttoGazzetta(html) ?? idLocale;
    const riferimentoGu = estraiRiferimentoGu(html) ??
        `Gazzetta Ufficiale del ${formattaDataItaliana(dataPubblicazione)}`;
    const entrataInVigore = estraiEntrataInVigore(html);
    const eli = `/eli/gu/${dataPubblicazione.replaceAll("-", "/")}/${idLocale}/sg`;
    const testo = [
        `Pubblicazione in Gazzetta Ufficiale della ${tipoDocumento} ${numero} del ${formattaDataItaliana(dataAtto)}.`,
        `Titolo: ${titolo}.`,
        `Riferimento ufficiale: ${riferimentoGu}.`,
        `Data di pubblicazione: ${formattaDataItaliana(dataPubblicazione)}.`,
        entrataInVigore ? `Entrata in vigore: ${entrataInVigore}.` : undefined
    ]
        .filter(Boolean)
        .join(" ");
    return `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="${escapeXmlAttribute(tipoDocumento)}">
    <meta>
      <identification source="#gazzetta-ufficiale">
        <FRBRWork>
          <FRBRthis value="${escapeXmlAttribute(eli)}" />
          <FRBRdate date="${escapeXmlAttribute(dataAtto)}" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="${escapeXmlAttribute(numero)}" />
          <FRBRname value="${escapeXmlAttribute(tipoDocumento)}" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="${escapeXmlAttribute(`${eli}/ita@${dataPubblicazione}`)}" />
          <FRBRdate date="${escapeXmlAttribute(dataPubblicazione)}" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>${escapeXmlText(titolo)}</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_1">
        <num>Art. 1</num>
        <heading>Pubblicazione in Gazzetta Ufficiale</heading>
        <paragraph eId="art_1__para_1">
          <num>1.</num>
          <content>
            <p>${escapeXmlText(testo)}</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
}
async function aggiungiCorpusBaseOpenGa(corpora, env, fetchImpl = fetch) {
    if (env.OPENGA_BASE_CORPUS_ENABLED !== "true") {
        return aggregaCorporaNormativi(corpora);
    }
    try {
        const documenti = await scaricaDocumentiOpenGaBase(env, fetchImpl);
        if (documenti.length > 0) {
            corpora.push(parseDocumentiAkomaNtoso(documenti));
        }
    }
    catch (error) {
        if (env.OPENGA_BASE_CORPUS_REQUIRED === "true") {
            throw error;
        }
    }
    return aggregaCorporaNormativi(corpora);
}
async function scaricaDocumentiOpenGaBase(env, fetchImpl) {
    const urls = (env.OPENGA_BASE_CORPUS_URLS ?? OPENGA_SENTENZE_SILENZIO_PA_URL)
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
    const adapter = new GiurisprudenzaApertaAdapter();
    const fetchOpenGa = creaFetchOpenGa(env, fetchImpl);
    const documenti = [];
    for (const url of urls) {
        const response = await fetchOpenGa(url, {
            headers: {
                accept: "text/csv,application/json;q=0.9,*/*;q=0.5",
                "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
            },
            method: "GET"
        });
        if (!response.ok) {
            throw new Error(`Download OpenGA fallito (${response.status} ${response.statusText}): ${url}`);
        }
        const csv = await response.text();
        const righe = selezionaRigheOpenGa(parseCsvRecords(csv), leggiOpenGaMaxRows(env), leggiParoleChiaveOpenGa(env));
        documenti.push(...righe.map((riga, index) => ({
            artifactId: `openga:${hashBreve(`${url}:${riga.NUMERO_PROVVEDIMENTO ?? ""}:${index}`)}`,
            fonte: adapter.fonte.nome,
            sourceUrl: `${url}#record-${index + 1}`,
            stato: "originaria",
            xml: convertiRigaOpenGaInAkomaNtoso(riga, url, index)
        })));
    }
    return documenti;
}
function convertiRigaOpenGaInAkomaNtoso(riga, sourceUrl, index) {
    const datasetTitle = titoloDatasetOpenGa(sourceUrl);
    const tipoProvvedimento = valoreOpenGa(riga, "TIPO_PROVVEDIMENTO") ?? "SENTENZA";
    const sede = valoreOpenGa(riga, "NOME_SEDE") ?? datasetTitle;
    const sezione = valoreOpenGa(riga, "NOME_SEZIONE");
    const numeroProvvedimento = valoreOpenGa(riga, "NUMERO_PROVVEDIMENTO") ?? `${hashBreve(sourceUrl)}-${index + 1}`;
    const numeroRicorso = valoreOpenGa(riga, "NUMERO_RICORSO");
    const anno = valoreOpenGa(riga, "ANNO_PUBBLICAZIONE") ?? "2024";
    const dataPubblicazione = normalizzaDataOpenGa(valoreOpenGa(riga, "DATA_PUBBLICAZIONE")) ?? `${anno}-01-01`;
    const dataDepositoRicorso = normalizzaDataOpenGa(valoreOpenGa(riga, "DATA_DEPOSITO_RICORSO"));
    const tipoUdienza = valoreOpenGa(riga, "TIPO_UDIENZA");
    const esito = valoreOpenGa(riga, "ESITO_PROVVEDIMENTO");
    const oggetto = valoreOpenGa(riga, "OGGETTO_RICORSO") ?? "Oggetto non indicato";
    const tipoRicorso = valoreOpenGa(riga, "TIPO_RICORSO");
    const membriCollegio = valoreOpenGa(riga, "NUM_MEMBRI_COLLEGIO");
    const idLocale = slugOpenGa(`${datasetTitle}-${numeroProvvedimento}-${dataPubblicazione}-${index + 1}`);
    const eli = `/eli/openga/giustizia-amministrativa/${idLocale}`;
    const titolo = `${tipoProvvedimento} ${sede} n. ${numeroProvvedimento}/${anno}`;
    const dettagli = [
        `OpenGA registra ${tipoProvvedimento.toLowerCase()} n. ${numeroProvvedimento}/${anno} del ${formattaDataItaliana(dataPubblicazione)} presso ${sede}.`,
        sezione ? `Sezione: ${sezione}.` : undefined,
        numeroRicorso ? `Numero ricorso: ${numeroRicorso}.` : undefined,
        dataDepositoRicorso
            ? `Deposito del ricorso: ${formattaDataItaliana(dataDepositoRicorso)}.`
            : undefined,
        tipoUdienza ? `Tipo udienza: ${tipoUdienza}.` : undefined,
        esito ? `Esito: ${esito}.` : undefined,
        `Oggetto del ricorso: ${oggetto}.`,
        tipoRicorso ? `Tipo ricorso: ${tipoRicorso}.` : undefined,
        membriCollegio ? `Componenti del collegio: ${membriCollegio}.` : undefined,
        `Dataset ufficiale: ${datasetTitle}.`
    ]
        .filter(Boolean)
        .join(" ");
    return `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="altro">
    <meta>
      <identification source="#openga">
        <FRBRWork>
          <FRBRthis value="${escapeXmlAttribute(eli)}" />
          <FRBRdate date="${escapeXmlAttribute(dataPubblicazione)}" name="generation" />
          <FRBRauthor href="/it/giustizia-amministrativa" as="#autorita" />
          <FRBRnumber value="${escapeXmlAttribute(numeroProvvedimento)}" />
          <FRBRname value="altro" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="${escapeXmlAttribute(`${eli}/ita@${dataPubblicazione}`)}" />
          <FRBRdate date="${escapeXmlAttribute(dataPubblicazione)}" name="version" />
          <FRBRauthor href="/it/giustizia-amministrativa" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>${escapeXmlText(titolo)}</docTitle>
      </p>
    </preface>
    <body>
      <article eId="art_1">
        <num>Art. 1</num>
        <heading>Scheda giurisprudenziale OpenGA</heading>
        <paragraph eId="art_1__para_1">
          <num>1.</num>
          <content>
            <p>${escapeXmlText(dettagli)}</p>
          </content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>`;
}
function selezionaRigheOpenGa(righe, maxRows, paroleChiave) {
    const preferite = righe.filter((riga) => {
        const testo = normalizza(Object.values(riga).join(" "));
        return paroleChiave.some((keyword) => testo.includes(normalizza(keyword)));
    });
    const base = preferite.length > 0 ? preferite : righe;
    return base.slice(0, maxRows);
}
function parseCsvRecords(csv) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    for (let index = 0; index < csv.length; index += 1) {
        const char = csv[index];
        const next = csv[index + 1];
        if (quoted) {
            if (char === "\"" && next === "\"") {
                field += "\"";
                index += 1;
            }
            else if (char === "\"") {
                quoted = false;
            }
            else {
                field += char;
            }
            continue;
        }
        if (char === "\"") {
            quoted = true;
        }
        else if (char === ",") {
            row.push(field.trim());
            field = "";
        }
        else if (char === "\n") {
            row.push(field.trim());
            rows.push(row);
            row = [];
            field = "";
        }
        else if (char !== "\r") {
            field += char;
        }
    }
    if (field.length > 0 || row.length > 0) {
        row.push(field.trim());
        rows.push(row);
    }
    const headers = rows.shift()?.map((header) => header.trim()) ?? [];
    return rows
        .filter((values) => values.some((value) => value.trim().length > 0))
        .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""])));
}
function leggiOpenGaMaxRows(env) {
    const parsed = Number(env.OPENGA_BASE_CORPUS_MAX_ROWS);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 20;
}
function leggiParoleChiaveOpenGa(env) {
    const keywords = leggiListaEnv(env.OPENGA_BASE_CORPUS_KEYWORDS);
    return keywords.length > 0
        ? keywords
        : ["silenzio", "accesso", "permesso", "appalto"];
}
function valoreOpenGa(riga, campo) {
    const value = riga[campo]?.replace(/\s+/g, " ").trim();
    return value && value.length > 0 ? value : undefined;
}
function normalizzaDataOpenGa(value) {
    if (!value) {
        return undefined;
    }
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}
function titoloDatasetOpenGa(sourceUrl) {
    const filename = sourceUrl.split("/").pop()?.replace(/\.(csv|json|ods)$/i, "") ?? "openga";
    return filename
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
function slugOpenGa(value) {
    return normalizza(value)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
}
function normalizza(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}
async function scaricaFonteConRetry(env, descrizione, operation) {
    const tentativi = leggiTentativiFetch(env);
    let ultimoErrore;
    for (let attempt = 1; attempt <= tentativi; attempt += 1) {
        try {
            return await operation();
        }
        catch (error) {
            ultimoErrore = error;
            if (attempt < tentativi) {
                await sleep(400 * attempt);
            }
        }
    }
    const dettaglio = ultimoErrore instanceof Error ? ultimoErrore.message : "errore sconosciuto";
    throw new Error(`${descrizione}: ${dettaglio}`);
}
function leggiTentativiFetch(env) {
    const parsed = Number(env.WORKER_FETCH_RETRY_ATTEMPTS);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 3;
}
async function scaricaDocumentiDaManifesto(adapter, documentiManifesto, env, fetchImpl) {
    const output = [];
    for (const documento of documentiManifesto) {
        if (documento.urn) {
            const urn = documento.urn;
            const scaricato = await scaricaFonteConRetry(env, `Open Data Normattiva ${documento.id}`, () => scaricaAttoNormattivaOpenData(adapter, urn, fetchImpl));
            output.push({
                artifactId: `normattiva:${documento.id}:vigente`,
                fonte: scaricato.fonte.nome,
                sourceUrl: scaricato.sourceUrl,
                stato: "vigente",
                xml: scaricato.xml
            });
        }
        else {
            const scaricato = await scaricaFonteConRetry(env, `manifesto Normattiva ${documento.id}`, () => scaricaDocumentoAkomaNtoso(adapter, documento.url, fetchImpl));
            output.push({
                artifactId: `normattiva:${documento.id}:vigente`,
                fonte: scaricato.fonte.nome,
                sourceUrl: scaricato.sourceUrl,
                stato: "vigente",
                xml: scaricato.xml
            });
        }
        for (const versione of documento.versioni ?? []) {
            const url = versione.url ?? documento.url;
            if (versione.urn) {
                const urn = versione.urn;
                const scaricato = await scaricaFonteConRetry(env, `Open Data Normattiva ${documento.id}/${versione.id}`, () => scaricaAttoNormattivaOpenData(adapter, urn, fetchImpl));
                output.push({
                    artifactId: `normattiva:${documento.id}:${versione.id}`,
                    fonte: scaricato.fonte.nome,
                    sourceUrl: scaricato.sourceUrl,
                    stato: versione.stato,
                    vigenzaA: versione.vigenzaA,
                    xml: scaricato.xml
                });
            }
            else if (versione.url) {
                const scaricato = await scaricaFonteConRetry(env, `manifesto Normattiva ${documento.id}/${versione.id}`, () => scaricaDocumentoAkomaNtoso(adapter, url, fetchImpl));
                output.push({
                    artifactId: `normattiva:${documento.id}:${versione.id}`,
                    fonte: scaricato.fonte.nome,
                    sourceUrl: scaricato.sourceUrl,
                    stato: versione.stato,
                    vigenzaA: versione.vigenzaA,
                    xml: scaricato.xml
                });
            }
        }
    }
    return output;
}
export async function leggiSorgentiNormattiva(env = process.env) {
    const details = leggiDettagliSorgentiNormattivaEnv(env);
    const urls = new Set(details.urls);
    const urns = new Set(details.urns);
    const manifestPath = env.NORMATTIVA_CORPUS_MANIFEST?.trim();
    let manifestId;
    let documentiManifesto = [];
    if (manifestPath) {
        const manifest = await leggiManifestoCorpusNormattiva(manifestPath);
        manifestId = manifest.id;
        documentiManifesto = manifest.documenti.filter((documento) => documento.statoPolicy !== "bloccata");
    }
    const documentiDaUrn = [...urns].map(creaDocumentoManifestoDaUrn);
    return {
        documentiManifesto: [...documentiManifesto, ...documentiDaUrn],
        manifestId,
        manifestPath: details.manifestPath,
        modalita: details.modalita,
        urns: [...urns],
        urls: [...urls]
    };
}
export async function leggiManifestoCorpusNormattiva(filePath) {
    const raw = await readManifestFile(filePath);
    const parsed = JSON.parse(raw);
    if (parsed.formato !== "italian-oss-legal-platform.corpus-manifest.v1") {
        throw new Error(`Manifesto corpus Normattiva non supportato: ${parsed.formato ?? "formato mancante"}.`);
    }
    if (parsed.fonte !== "Normattiva") {
        throw new Error("Il manifesto corpus deve dichiarare fonte Normattiva.");
    }
    if (!parsed.id || !Array.isArray(parsed.documenti)) {
        throw new Error("Manifesto corpus Normattiva privo di id o documenti.");
    }
    for (const documento of parsed.documenti) {
        if (!documento.id || !documento.titolo || !documento.eli || !documento.url) {
            throw new Error("Ogni documento del manifesto richiede id, titolo, ELI e URL.");
        }
        new URL(documento.url);
        for (const versione of documento.versioni ?? []) {
            if (!versione.id || !versione.stato || (!versione.urn && !versione.url)) {
                throw new Error("Ogni versione del manifesto richiede id, stato e almeno urn o url.");
            }
            if (versione.url) {
                new URL(versione.url);
            }
        }
    }
    return {
        descrizione: parsed.descrizione,
        documenti: parsed.documenti,
        fonte: parsed.fonte,
        formato: parsed.formato,
        id: parsed.id
    };
}
async function readManifestFile(filePath) {
    const candidates = [
        resolve(filePath),
        resolve(process.cwd(), "..", "..", filePath)
    ];
    let lastError;
    for (const candidate of [...new Set(candidates)]) {
        try {
            return await readFile(candidate, "utf8");
        }
        catch (error) {
            lastError = error;
        }
    }
    throw lastError;
}
function leggiListaEnv(value) {
    return (value ?? "")
        .split(/[\n;,]+/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}
function deduplicaValori(values) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
function leggiDettagliSorgentiNormattivaEnv(env) {
    const urls = leggiListaEnv(env.NORMATTIVA_INGEST_URLS);
    const urns = leggiListaEnv(env.NORMATTIVA_INGEST_URNS);
    const manifestPath = env.NORMATTIVA_CORPUS_MANIFEST?.trim();
    const hasManifest = Boolean(manifestPath);
    const modalita = hasManifest && urls.length > 0
        ? "manifest-e-url-live"
        : hasManifest
            ? "manifest-live"
            : urls.length > 0 || urns.length > 0
                ? "url-live"
                : "corpus-locale";
    return {
        documentiManifesto: [],
        manifestPath: manifestPath || undefined,
        modalita,
        urns,
        urls
    };
}
function creaDocumentoManifestoDaUrn(urn) {
    const parsed = parseUrnPerManifesto(urn);
    return {
        eli: parsed.eli,
        id: parsed.id,
        motivo: "Recupero online mirato richiesto da una domanda senza fonti locali.",
        titolo: parsed.titolo,
        urn,
        url: creaUrlNormattivaDaUrn(urn)
    };
}
function parseUrnPerManifesto(urn) {
    const match = urn.match(/^urn:nir:stato:(.+):(\d{4})(?:-(\d{2})-(\d{2}))?;([^!~:]+)(?:.*?~art([0-9a-z-]+))?/i);
    const tipoAtto = normalizzaTipoAttoManifesto(match?.[1] ?? "atto");
    const anno = match?.[2] ?? "0000";
    const mese = match?.[3] ?? "01";
    const giorno = match?.[4] ?? "01";
    const numero = match?.[5] ?? hashBreve(urn);
    const articolo = match?.[6];
    const id = [
        tipoAtto.replace(/[^a-z0-9]+/g, "-"),
        numero,
        anno,
        articolo ? `art-${articolo}` : undefined
    ]
        .filter(Boolean)
        .join("-");
    return {
        eli: `/eli/it/stato/${tipoAtto.replaceAll(".", "-")}/${anno}/${mese}/${giorno}/${numero}`,
        id,
        titolo: `${tipoAtto.replaceAll(".", " ")} ${numero}/${anno}${articolo ? `, art. ${articolo}` : ""}`
    };
}
function normalizzaTipoAttoManifesto(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ".")
        .replace(/-+/g, ".");
}
function leggiIntervalloScheduler(env) {
    const rawValue = env.WORKER_SCHEDULE_INTERVAL_SECONDS ?? "86400";
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 60) {
        throw new Error("WORKER_SCHEDULE_INTERVAL_SECONDS deve essere un numero di almeno 60 secondi.");
    }
    return value;
}
async function sleep(ms, signal) {
    if (signal?.aborted) {
        return;
    }
    await new Promise((resolve) => {
        const timeout = setTimeout(resolve, ms);
        signal?.addEventListener("abort", () => {
            clearTimeout(timeout);
            resolve();
        }, { once: true });
    });
}
async function registraCatalogoFonti(database) {
    for (const fonte of fontiCatalogabili()) {
        const command = comandoUpsertSourceCatalog({
            dettagli: fonte.dettagli,
            fonte: fonte.fonte,
            id: fonte.id,
            licenza: fonte.licenza,
            riuso: fonte.riuso,
            stato: fonte.stato,
            tipo: fonte.tipo,
            url: fonte.url
        });
        await database.query(command.text, command.values);
    }
}
async function registraApprovazioniPolicyFonti(database) {
    for (const fonte of fontiCatalogabili()) {
        const evidenze = leggiEvidenzeRiuso(fonte.dettagli.evidenzeRiuso);
        const stato = fonte.stato === "abilitata"
            ? "approvata"
            : fonte.riuso === "vietato"
                ? "respinta"
                : "da-verificare";
        const command = comandoUpsertSourcePolicyApproval({
            approvata_da: stato === "approvata" ? "policy-fonti-runtime" : null,
            evidenza_url: evidenze[0] ?? null,
            fonte_id: fonte.id,
            id: `source-policy:${fonte.id}`,
            nota: [
                fonte.licenza,
                stringOrUndefined(fonte.dettagli.ambitoRiuso),
                evidenze.length > 1 ? `Evidenze: ${evidenze.join(" | ")}` : undefined
            ]
                .filter(Boolean)
                .join(" - "),
            stato
        });
        await database.query(command.text, command.values);
    }
}
async function pulisciCorpusNormativo(database) {
    await database.query("begin");
    try {
        await database.query("delete from source_runs");
        await database.query("delete from riferimenti_normativi");
        await database.query("delete from chunk_normativi");
        await database.query("delete from unita_normative");
        await database.query("delete from items_fonte");
        await database.query("delete from manifestazioni");
        await database.query("delete from versioni");
        await database.query("delete from norme");
        await database.query("delete from artefatti_fonte");
        await database.query("commit");
    }
    catch (error) {
        await database.query("rollback");
        throw error;
    }
}
async function registraSourceRuns(database, jobId, documentiFonte, artefatti) {
    const repository = new PostgresIngestJobRepository(database);
    for (const documentoFonte of documentiFonte) {
        const archiviato = artefatti.find((artefatto) => artefatto.chiave === documentoFonte.nomeFile);
        await repository.registraRunFonte({
            dettagli: {
                chiave: documentoFonte.nomeFile,
                sha256: documentoFonte.artefatto.sha256,
                storageUri: archiviato?.uri
            },
            fonte: documentoFonte.artefatto.fonte,
            id: `${jobId}:${documentoFonte.nomeFile}`,
            job_id: jobId,
            stato: "acquisita",
            url_fonte: documentoFonte.artefatto.urlFonte
        });
    }
}
async function registraVerificheOperativeFonti(database, jobId, env, fetchImpl = fetch) {
    if (env.OPENGA_REACHABILITY_CHECK_ENABLED !== "true") {
        return;
    }
    const adapter = new GiurisprudenzaApertaAdapter();
    const richiesta = adapter.pianificaRichieste()[0];
    if (!richiesta) {
        return;
    }
    const repository = new PostgresIngestJobRepository(database);
    const id = `${jobId}:openga:reachability`;
    const fetchOpenGa = creaFetchOpenGa(env, fetchImpl);
    try {
        const response = await fetchOpenGa(richiesta.url, {
            headers: {
                accept: "text/html,application/json;q=0.9,*/*;q=0.5",
                "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
            },
            method: richiesta.metodo
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
        }
        await repository.registraRunFonte({
            dettagli: {
                motivo: "Fonte raggiungibile; ingest giurisprudenziale configurato su dataset CSV selezionati.",
                tlsCompat: env.OPENGA_ALLOW_INSECURE_TLS === "true" ? "openga-only" : "standard",
                verifica: "reachability"
            },
            fonte: adapter.fonte.nome,
            id,
            job_id: jobId,
            stato: "saltata",
            url_fonte: richiesta.url
        });
    }
    catch (error) {
        await repository.registraRunFonte({
            dettagli: {
                errore: error instanceof Error ? error.message : "Errore verifica OpenGA.",
                tlsCompat: env.OPENGA_ALLOW_INSECURE_TLS === "true" ? "openga-only" : "standard",
                verifica: "reachability"
            },
            fonte: adapter.fonte.nome,
            id,
            job_id: jobId,
            stato: "fallita",
            url_fonte: richiesta.url
        });
    }
}
function creaFetchOpenGa(env, fetchImpl) {
    return async (url, init) => {
        if (deveUsareCompatibilitaTlsOpenGa(env, url)) {
            return await fetchHttpsSenzaValidazioneGlobale(url, init);
        }
        return await fetchImpl(url, init);
    };
}
function deveUsareCompatibilitaTlsOpenGa(env, url) {
    if (env.OPENGA_ALLOW_INSECURE_TLS !== "true") {
        return false;
    }
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.hostname === OPENGA_HOSTNAME;
    }
    catch {
        return false;
    }
}
async function fetchHttpsSenzaValidazioneGlobale(url, init, redirectCount = 0) {
    const parsed = new URL(url);
    return await new Promise((resolve, reject) => {
        const req = request({
            headers: init?.headers,
            hostname: parsed.hostname,
            method: init?.method ?? "GET",
            path: `${parsed.pathname}${parsed.search}`,
            port: parsed.port ? Number(parsed.port) : undefined,
            rejectUnauthorized: false
        }, (res) => {
            const status = res.statusCode ?? 0;
            const location = res.headers.location;
            if (location &&
                redirectCount < 5 &&
                [301, 302, 303, 307, 308].includes(status)) {
                res.resume();
                resolve(fetchHttpsSenzaValidazioneGlobale(new URL(location, url).toString(), init, redirectCount + 1));
                return;
            }
            const chunks = [];
            res.on("data", (chunk) => {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            res.on("end", () => {
                const body = Buffer.concat(chunks).toString("utf8");
                resolve({
                    headers: {
                        get(name) {
                            const value = res.headers[name.toLowerCase()];
                            if (Array.isArray(value)) {
                                return value.join(", ");
                            }
                            return value ?? null;
                        }
                    },
                    ok: status >= 200 && status < 300,
                    status,
                    statusText: res.statusMessage ?? "",
                    async text() {
                        return body;
                    }
                });
            });
        });
        req.on("error", reject);
        if (init?.body) {
            req.write(init.body);
        }
        req.end();
    });
}
async function migrationApplicata(database, id) {
    const result = (await database.query("select id from schema_migrations where id = $1", [id]));
    return Boolean(result.rows?.length);
}
function leggiEvidenzeRiuso(value) {
    return Array.isArray(value)
        ? value.filter((entry) => typeof entry === "string" && entry.length > 0)
        : [];
}
function estraiMetaHtml(html, property) {
    const tag = estraiMetaTagHtml(html, property);
    return tag ? leggiAttributoHtml(tag, "content") : undefined;
}
function estraiResourceFinaleMetaHtml(html, property) {
    const tag = estraiMetaTagHtml(html, property);
    const resource = tag ? leggiAttributoHtml(tag, "resource") : undefined;
    return resource?.split("#").pop()?.toLowerCase();
}
function estraiMetaTagHtml(html, property) {
    const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
    return tags.find((tag) => leggiAttributoHtml(tag, "property") === property ||
        leggiAttributoHtml(tag, "name") === property);
}
function estraiTestoProprietaHtml(html, property) {
    const regex = new RegExp(`<([a-z0-9]+)\\b[^>]*property=["']${escapeRegex(property)}["'][^>]*>([\\s\\S]*?)<\\/\\1>`, "i");
    const match = html.match(regex);
    return pulisciTestoHtml(match?.[2]);
}
function estraiNumeroAttoGazzetta(html) {
    const heading = html.match(/<h2\b[^>]*class=["'][^"']*consultazione[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i);
    const text = pulisciTestoHtml(heading?.[1]) ?? pulisciTestoHtml(html) ?? "";
    const match = text.match(/\bn\.\s*([0-9]+)\b/i);
    return match?.[1];
}
function estraiRiferimentoGu(html) {
    const text = pulisciTestoHtml(html) ?? "";
    const match = text.match(/\bGU\s+Serie\s+Generale\s+n\.?\s*([0-9]+)\s+del\s+([0-9-]+)/i);
    return match ? `GU Serie Generale n.${match[1]} del ${match[2]}` : undefined;
}
function estraiEntrataInVigore(html) {
    const text = pulisciTestoHtml(html) ?? "";
    const match = text.match(/Entrata\s+in\s+vigore\s+della\s+legge\s*:\s*([0-9-]+)/i);
    return match?.[1];
}
function leggiAttributoHtml(tag, name) {
    const regex = new RegExp(`${escapeRegex(name)}\\s*=\\s*["']([^"']+)["']`, "i");
    const value = tag.match(regex)?.[1];
    return value ? decodificaHtml(value) : undefined;
}
function pulisciTestoHtml(value) {
    const text = decodificaHtml(value ?? "")
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return text.length > 0 ? text : undefined;
}
function decodificaHtml(value) {
    return value
        .replace(/&nbsp;/g, " ")
        .replace(/&agrave;/g, "a")
        .replace(/&egrave;/g, "e")
        .replace(/&eacute;/g, "e")
        .replace(/&igrave;/g, "i")
        .replace(/&ograve;/g, "o")
        .replace(/&ugrave;/g, "u")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'");
}
function normalizzaTipoGazzetta(value) {
    const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, "-");
    if (normalized === "legge") {
        return "legge";
    }
    if (normalized === "decreto-legislativo") {
        return "decreto-legislativo";
    }
    if (normalized === "decreto-legge") {
        return "decreto-legge";
    }
    if (normalized === "regolamento") {
        return "regolamento";
    }
    return "altro";
}
function formattaDataItaliana(value) {
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}-${month}-${year}` : value;
}
function escapeXmlText(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function escapeXmlAttribute(value) {
    return escapeXmlText(value).replace(/"/g, "&quot;");
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function hashBreve(value) {
    return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 12);
}
function stringOrUndefined(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }
    return typeof value === "string" && value.length > 0 ? value : undefined;
}
