export class SnapshotDatabaseError extends Error {
    violazioni;
    constructor(violazioni) {
        super(`Snapshot database non valido: ${violazioni.join("; ")}`);
        this.violazioni = violazioni;
        this.name = "SnapshotDatabaseError";
    }
}
export function creaSnapshotDatabase(corpus) {
    const norme = corpus.norme ?? [corpus.norma];
    const versioni = corpus.versioni ?? [corpus.versione];
    const artefatti = corpus.artefatti ?? [corpus.artefatto];
    return {
        norme: norme.map((norma) => ({
            eli: norma.eli,
            tipo_atto: norma.tipoAtto,
            numero: norma.numero,
            data_atto: norma.data,
            titolo: norma.titolo,
            fonte: norma.fonte
        })),
        versioni: versioni.map((versione) => ({
            id: versione.id,
            norma_eli: versione.normaEli,
            vigenza_da: versione.vigenzaDa,
            vigenza_a: versione.vigenzaA ?? null,
            stato: versione.stato
        })),
        unita_normative: corpus.unita.map((unita) => ({
            id: unita.id,
            versione_id: unita.versioneId,
            tipo: unita.tipo,
            numero: unita.numero,
            percorso: unita.percorso,
            testo: unita.testo,
            eli_unita: unita.eliUnita ?? null
        })),
        artefatti_fonte: artefatti.map((artefatto) => ({
            id: artefatto.id,
            fonte: artefatto.fonte,
            formato: artefatto.formato,
            sha256: artefatto.sha256,
            url_fonte: artefatto.urlFonte,
            dimensione_byte: artefatto.dimensioneByte
        })),
        manifestazioni: corpus.manifestazioni.map((manifestazione) => ({
            formato: manifestazione.formato,
            id: manifestazione.id,
            sha256: manifestazione.sha256,
            url_fonte: manifestazione.urlFonte,
            versione_id: manifestazione.versioneId
        })),
        items_fonte: corpus.itemsFonte.map((item) => ({
            dimensione_byte: item.dimensioneByte,
            id: item.id,
            manifestazione_id: item.manifestazioneId,
            storage_uri: item.storageUri ?? null
        })),
        chunk_normativi: corpus.chunks.map((chunk) => ({
            id: chunk.id,
            unita_id: chunk.unitaId,
            artefatto_fonte_id: chunk.metadati.idArtefattoFonte ?? null,
            testo: chunk.testo,
            embedding: chunk.embedding ? [...chunk.embedding] : null,
            citation_eli: chunk.metadati.eli,
            citation_fonte: chunk.metadati.fonte,
            citation_tipo_atto: chunk.metadati.tipoAtto,
            citation_numero_atto: chunk.metadati.numeroAtto,
            citation_data_atto: chunk.metadati.dataAtto,
            citation_articolo: chunk.metadati.articolo,
            citation_comma: chunk.metadati.comma ?? null,
            citation_vigenza_da: chunk.metadati.vigenzaDa,
            citation_vigenza_a: chunk.metadati.vigenzaA ?? null,
            citation_url_fonte: chunk.metadati.urlFonte ?? null
        })),
        riferimenti_normativi: corpus.riferimenti.map((riferimento) => creaRiferimentoNormativoRow(riferimento, corpus))
    };
}
export function contaSnapshotDatabase(snapshot) {
    return {
        norme: snapshot.norme.length,
        versioni: snapshot.versioni.length,
        unita_normative: snapshot.unita_normative.length,
        artefatti_fonte: snapshot.artefatti_fonte.length,
        manifestazioni: snapshot.manifestazioni.length,
        items_fonte: snapshot.items_fonte.length,
        chunk_normativi: snapshot.chunk_normativi.length,
        riferimenti_normativi: snapshot.riferimenti_normativi.length
    };
}
function creaRiferimentoNormativoRow(riferimento, corpus) {
    const target = risolviTargetRiferimento(riferimento.aEli, corpus);
    const isEurLex = isEurLexEli(riferimento.aEli);
    const isNormattiva = riferimento.aEli.startsWith("/eli/it/");
    const statoRisoluzione = target
        ? "risolto"
        : isEurLex
            ? "esterno"
            : "pendente";
    return {
        a_eli: riferimento.aEli,
        confidenza: riferimento.confidenza ??
            (riferimento.fonteEstrazione === "akn-ref" ? 0.95 : 0.7),
        da_eli: riferimento.daEli,
        fonte_estrazione: riferimento.fonteEstrazione ?? "testo-regex",
        stato_risoluzione: statoRisoluzione,
        target_fonte: target?.fonte ?? (isEurLex ? "EUR-Lex" : isNormattiva ? "Normattiva" : null),
        target_risolto: Boolean(target),
        target_titolo: target?.titolo ?? (isEurLex ? descriviEliEuropeo(riferimento.aEli) : null),
        target_url_fonte: target?.urlFonte ??
            (isEurLex ? `https://eur-lex.europa.eu${riferimento.aEli}` : urlNormattivaDaEli(riferimento.aEli)),
        testo_match: riferimento.testoMatch ?? null,
        tipo: riferimento.tipo
    };
}
function risolviTargetRiferimento(targetEli, corpus) {
    const unita = corpus.unita.find((item) => item.eliUnita === targetEli);
    const versione = unita
        ? corpus.versioni.find((item) => item.id === unita.versioneId)
        : undefined;
    const norma = corpus.norme.find((item) => item.eli === targetEli) ??
        corpus.norme.find((item) => item.eli === versione?.normaEli);
    if (!norma) {
        return null;
    }
    const chunk = corpus.chunks.find((item) => item.metadati.eli === targetEli ||
        item.metadati.eli.startsWith(`${targetEli}/`));
    return {
        fonte: norma.fonte,
        titolo: norma.titolo,
        urlFonte: chunk?.metadati.urlFonte
    };
}
function isEurLexEli(value) {
    return /^\/eli\/(?:reg|dir|dec|treaty)\//.test(value);
}
function descriviEliEuropeo(value) {
    const treatyMatch = value.match(/^\/eli\/treaty\/([^/]+)\/art_?([0-9]+)\/oj$/);
    if (treatyMatch) {
        const trattato = treatyMatch[1]?.toUpperCase().replace(/_[0-9]{4}$/, "") ?? "UE";
        return `Articolo ${treatyMatch[2]} ${trattato}`;
    }
    const match = value.match(/^\/eli\/(reg|dir|dec)\/(\d{4})\/([^/]+)\/oj$/);
    if (!match) {
        return "Normativa UE collegata";
    }
    const tipo = match[1] === "reg" ? "Regolamento" : match[1] === "dir" ? "Direttiva" : "Decisione";
    return `${tipo} UE ${match[2]}/${match[3]}`;
}
function urlNormattivaDaEli(value) {
    const match = value.match(/^\/eli\/it\/stato\/([^/]+)\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)/);
    if (!match) {
        return null;
    }
    const tipo = match[1]?.replaceAll("-", ".");
    return `https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:${tipo}:${match[2]}-${match[3]}-${match[4]};${match[5]}`;
}
export function validaSnapshotDatabase(snapshot) {
    const violazioni = [];
    const norme = new Set(snapshot.norme.map((norma) => norma.eli));
    const versioni = new Set(snapshot.versioni.map((versione) => versione.id));
    const unita = new Set(snapshot.unita_normative.map((row) => row.id));
    const artefatti = new Set(snapshot.artefatti_fonte.map((row) => row.id));
    const manifestazioni = new Set(snapshot.manifestazioni.map((row) => row.id));
    for (const versione of snapshot.versioni) {
        if (!norme.has(versione.norma_eli)) {
            violazioni.push(`versione senza norma: ${versione.id}`);
        }
    }
    for (const row of snapshot.unita_normative) {
        if (!versioni.has(row.versione_id)) {
            violazioni.push(`unità senza versione: ${row.id}`);
        }
        if (row.testo.trim().length === 0) {
            violazioni.push(`unità senza testo: ${row.id}`);
        }
    }
    for (const row of snapshot.manifestazioni) {
        if (!versioni.has(row.versione_id)) {
            violazioni.push(`manifestazione senza versione: ${row.id}`);
        }
        if (row.sha256.trim().length === 0 || row.url_fonte.trim().length === 0) {
            violazioni.push(`manifestazione senza fonte tracciabile: ${row.id}`);
        }
    }
    for (const row of snapshot.items_fonte) {
        if (!manifestazioni.has(row.manifestazione_id)) {
            violazioni.push(`item fonte senza manifestazione: ${row.id}`);
        }
    }
    for (const row of snapshot.chunk_normativi) {
        if (!unita.has(row.unita_id)) {
            violazioni.push(`chunk senza unità: ${row.id}`);
        }
        if (row.artefatto_fonte_id !== null &&
            !artefatti.has(row.artefatto_fonte_id)) {
            violazioni.push(`chunk con artefatto fonte mancante: ${row.id}`);
        }
        if (row.citation_url_fonte === null && row.artefatto_fonte_id === null) {
            violazioni.push(`chunk senza tracciabilita fonte: ${row.id}`);
        }
        if (row.citation_eli.trim().length === 0 || row.citation_articolo.trim().length === 0) {
            violazioni.push(`chunk senza metadati citazione obbligatori: ${row.id}`);
        }
    }
    for (const row of snapshot.riferimenti_normativi) {
        if (row.da_eli.trim().length === 0 || row.a_eli.trim().length === 0) {
            violazioni.push(`riferimento senza ELI: ${row.da_eli} -> ${row.a_eli}`);
        }
        if (row.confidenza < 0 || row.confidenza > 1) {
            violazioni.push(`riferimento con confidenza non valida: ${row.da_eli} -> ${row.a_eli}`);
        }
        if (row.stato_risoluzione !== "risolto" &&
            row.stato_risoluzione !== "esterno" &&
            row.stato_risoluzione !== "pendente") {
            violazioni.push(`riferimento con stato non valido: ${row.da_eli} -> ${row.a_eli}`);
        }
    }
    return violazioni;
}
export function assertSnapshotDatabase(snapshot) {
    const violazioni = validaSnapshotDatabase(snapshot);
    if (violazioni.length > 0) {
        throw new SnapshotDatabaseError(violazioni);
    }
}
export function generaComandiUpsertSnapshot(snapshot) {
    assertSnapshotDatabase(snapshot);
    return [
        ...snapshot.norme.map((row) => ({
            text: `insert into norme (eli, tipo_atto, numero, data_atto, titolo, fonte)
values ($1, $2, $3, $4, $5, $6)
on conflict (eli) do update set
  tipo_atto = excluded.tipo_atto,
  numero = excluded.numero,
  data_atto = excluded.data_atto,
  titolo = excluded.titolo,
  fonte = excluded.fonte`,
            values: [
                row.eli,
                row.tipo_atto,
                row.numero,
                row.data_atto,
                row.titolo,
                row.fonte
            ]
        })),
        ...snapshot.artefatti_fonte.map((row) => ({
            text: `insert into artefatti_fonte (id, fonte, formato, sha256, url_fonte, dimensione_byte)
values ($1, $2, $3, $4, $5, $6)
on conflict (id) do update set
  fonte = excluded.fonte,
  formato = excluded.formato,
  sha256 = excluded.sha256,
  url_fonte = excluded.url_fonte,
  dimensione_byte = excluded.dimensione_byte`,
            values: [
                row.id,
                row.fonte,
                row.formato,
                row.sha256,
                row.url_fonte,
                row.dimensione_byte
            ]
        })),
        ...snapshot.versioni.map((row) => ({
            text: `insert into versioni (id, norma_eli, vigenza_da, vigenza_a, stato)
values ($1, $2, $3, $4, $5)
on conflict (id) do update set
  norma_eli = excluded.norma_eli,
  vigenza_da = excluded.vigenza_da,
  vigenza_a = excluded.vigenza_a,
  stato = excluded.stato`,
            values: [row.id, row.norma_eli, row.vigenza_da, row.vigenza_a, row.stato]
        })),
        ...snapshot.manifestazioni.map((row) => ({
            text: `insert into manifestazioni (id, versione_id, formato, url_fonte, sha256)
values ($1, $2, $3, $4, $5)
on conflict (id) do update set
  versione_id = excluded.versione_id,
  formato = excluded.formato,
  url_fonte = excluded.url_fonte,
  sha256 = excluded.sha256`,
            values: [row.id, row.versione_id, row.formato, row.url_fonte, row.sha256]
        })),
        ...snapshot.items_fonte.map((row) => ({
            text: `insert into items_fonte (id, manifestazione_id, storage_uri, dimensione_byte)
values ($1, $2, $3, $4)
on conflict (id) do update set
  manifestazione_id = excluded.manifestazione_id,
  storage_uri = excluded.storage_uri,
  dimensione_byte = excluded.dimensione_byte`,
            values: [row.id, row.manifestazione_id, row.storage_uri, row.dimensione_byte]
        })),
        ...snapshot.unita_normative.map((row) => ({
            text: `insert into unita_normative (id, versione_id, tipo, numero, percorso, testo, eli_unita)
values ($1, $2, $3, $4, $5, $6, $7)
on conflict (id) do update set
  versione_id = excluded.versione_id,
  tipo = excluded.tipo,
  numero = excluded.numero,
  percorso = excluded.percorso,
  testo = excluded.testo,
  eli_unita = excluded.eli_unita`,
            values: [
                row.id,
                row.versione_id,
                row.tipo,
                row.numero,
                row.percorso,
                row.testo,
                row.eli_unita
            ]
        })),
        ...snapshot.chunk_normativi.map((row) => ({
            text: `insert into chunk_normativi (
  id,
  unita_id,
  artefatto_fonte_id,
  testo,
  embedding,
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
)
values ($1, $2, $3, $4, $5::vector, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
on conflict (id) do update set
  unita_id = excluded.unita_id,
  artefatto_fonte_id = excluded.artefatto_fonte_id,
  testo = excluded.testo,
  embedding = excluded.embedding,
  citation_eli = excluded.citation_eli,
  citation_fonte = excluded.citation_fonte,
  citation_tipo_atto = excluded.citation_tipo_atto,
  citation_numero_atto = excluded.citation_numero_atto,
  citation_data_atto = excluded.citation_data_atto,
  citation_articolo = excluded.citation_articolo,
  citation_comma = excluded.citation_comma,
  citation_vigenza_da = excluded.citation_vigenza_da,
  citation_vigenza_a = excluded.citation_vigenza_a,
  citation_url_fonte = excluded.citation_url_fonte`,
            values: [
                row.id,
                row.unita_id,
                row.artefatto_fonte_id,
                row.testo,
                row.embedding ? toPgVector(row.embedding) : null,
                row.citation_eli,
                row.citation_fonte,
                row.citation_tipo_atto,
                row.citation_numero_atto,
                row.citation_data_atto,
                row.citation_articolo,
                row.citation_comma,
                row.citation_vigenza_da,
                row.citation_vigenza_a,
                row.citation_url_fonte
            ]
        })),
        ...snapshot.riferimenti_normativi.map((row) => ({
            text: `insert into riferimenti_normativi (
  da_eli,
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
)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
on conflict (da_eli, a_eli, tipo) do update set
  fonte_estrazione = excluded.fonte_estrazione,
  testo_match = excluded.testo_match,
  confidenza = excluded.confidenza,
  stato_risoluzione = excluded.stato_risoluzione,
  target_risolto = excluded.target_risolto,
  target_fonte = excluded.target_fonte,
  target_titolo = excluded.target_titolo,
  target_url_fonte = excluded.target_url_fonte,
  aggiornato_il = now()`,
            values: [
                row.da_eli,
                row.a_eli,
                row.tipo,
                row.fonte_estrazione,
                row.testo_match,
                row.confidenza,
                row.stato_risoluzione,
                row.target_risolto,
                row.target_fonte,
                row.target_titolo,
                row.target_url_fonte
            ]
        }))
    ];
}
export function comandoIniziaIngestJob(input) {
    return {
        text: `insert into ingest_jobs (id, fonte, stato, dettagli)
values ($1, $2, 'in_corso', $3::jsonb)
on conflict (id) do update set
  fonte = excluded.fonte,
  stato = 'in_corso',
  iniziato_il = now(),
  completato_il = null,
  errore = null,
  dettagli = excluded.dettagli`,
        values: [input.id, input.fonte, JSON.stringify(input.dettagli ?? {})]
    };
}
export function comandoCompletaIngestJob(input) {
    return {
        text: `update ingest_jobs
set stato = 'completato',
  completato_il = now(),
  errore = null,
  conteggi = $2::jsonb,
  dettagli = dettagli || $3::jsonb
where id = $1`,
        values: [
            input.id,
            JSON.stringify(input.conteggi),
            JSON.stringify(input.dettagli ?? {})
        ]
    };
}
export function comandoFallisceIngestJob(input) {
    return {
        text: `update ingest_jobs
set stato = 'fallito',
  completato_il = now(),
  errore = $2
where id = $1`,
        values: [input.id, input.errore]
    };
}
export function comandoUpsertSourceCatalog(row) {
    return {
        text: `insert into source_catalog (id, fonte, tipo, url, licenza, riuso, stato, dettagli)
values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
on conflict (id) do update set
  fonte = excluded.fonte,
  tipo = excluded.tipo,
  url = excluded.url,
  licenza = excluded.licenza,
  riuso = excluded.riuso,
  stato = excluded.stato,
  dettagli = excluded.dettagli,
  aggiornata_il = now()`,
        values: [
            row.id,
            row.fonte,
            row.tipo,
            row.url,
            row.licenza,
            row.riuso,
            row.stato,
            JSON.stringify(row.dettagli)
        ]
    };
}
export function comandoInserisciSourceRun(row) {
    return {
        text: `insert into source_runs (id, job_id, fonte, url_fonte, stato, dettagli)
values ($1, $2, $3, $4, $5, $6::jsonb)
on conflict (id) do update set
  job_id = excluded.job_id,
  fonte = excluded.fonte,
  url_fonte = excluded.url_fonte,
  stato = excluded.stato,
  dettagli = excluded.dettagli,
  acquisito_il = now()`,
        values: [
            row.id,
            row.job_id,
            row.fonte,
            row.url_fonte,
            row.stato,
            JSON.stringify(row.dettagli)
        ]
    };
}
export function comandoInserisciReviewQueue(row) {
    return {
        text: `insert into review_queue (
  id,
  domanda,
  risposta,
  stato,
  rischio,
  motivo,
  payload,
  assegnata_a,
  decisione,
  priorita,
  scadenza_il
)
values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
on conflict (id) do update set
  domanda = excluded.domanda,
  risposta = excluded.risposta,
  stato = excluded.stato,
  rischio = excluded.rischio,
  motivo = excluded.motivo,
  payload = excluded.payload,
  assegnata_a = excluded.assegnata_a,
  decisione = excluded.decisione,
  priorita = excluded.priorita,
  scadenza_il = excluded.scadenza_il,
  aggiornata_il = now()`,
        values: [
            row.id,
            row.domanda,
            row.risposta,
            row.stato,
            row.rischio,
            row.motivo ?? null,
            JSON.stringify(row.payload ?? {}),
            row.assegnata_a ?? null,
            row.decisione ?? null,
            row.priorita ?? "normale",
            row.scadenza_il ?? null
        ]
    };
}
export function comandoAggiornaReviewQueue(input) {
    return {
        text: `update review_queue
set stato = $2,
  motivo = coalesce($3, motivo),
  assegnata_a = coalesce($4, assegnata_a),
  decisione = coalesce($5, decisione),
  aggiornata_il = now()
where id = $1`,
        values: [
            input.id,
            input.stato,
            input.motivo ?? null,
            input.assegnataA ?? null,
            input.decisione ?? null
        ]
    };
}
export function comandoListaReviewQueue(limite = 20) {
    return {
        text: `select id,
  domanda,
  risposta,
  stato,
  rischio,
  motivo,
  payload,
  assegnata_a,
  decisione,
  priorita,
  scadenza_il,
  creata_il,
  aggiornata_il
from review_queue
order by creata_il desc
limit $1`,
        values: [limite]
    };
}
export function comandoInserisciReviewEvento(row) {
    return {
        text: `insert into review_eventi (id, review_id, operatore, stato_da, stato_a, nota)
values ($1, $2, $3, $4, $5, $6)
on conflict (id) do nothing`,
        values: [
            row.id,
            row.review_id,
            row.operatore,
            row.stato_da ?? null,
            row.stato_a,
            row.nota ?? null
        ]
    };
}
export function comandoInserisciDocumentoUtente(row) {
    return {
        text: `insert into documenti_utente (
  id,
  nome_file,
  content_type,
  storage_uri,
  dimensione_byte,
  sha256,
  stato,
  anteprima_testo,
  caricato_da
)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
on conflict (id) do update set
  nome_file = excluded.nome_file,
  content_type = excluded.content_type,
  storage_uri = excluded.storage_uri,
  dimensione_byte = excluded.dimensione_byte,
  sha256 = excluded.sha256,
  stato = excluded.stato,
  anteprima_testo = excluded.anteprima_testo,
  caricato_da = excluded.caricato_da`,
        values: [
            row.id,
            row.nome_file,
            row.content_type,
            row.storage_uri,
            row.dimensione_byte,
            row.sha256,
            row.stato,
            row.anteprima_testo ?? null,
            row.caricato_da ?? null
        ]
    };
}
export function comandoListaDocumentiUtente(limite = 50) {
    return {
        text: `select id,
  nome_file,
  content_type,
  storage_uri,
  dimensione_byte,
  sha256,
  stato,
  anteprima_testo,
  caricato_da,
  caricato_il
from documenti_utente
order by caricato_il desc
limit $1`,
        values: [limite]
    };
}
export function comandoLeggiDocumentoUtente(id) {
    return {
        text: `select id,
  nome_file,
  content_type,
  storage_uri,
  dimensione_byte,
  sha256,
  stato,
  anteprima_testo,
  caricato_da,
  caricato_il
from documenti_utente
where id = $1`,
        values: [id]
    };
}
export function comandoUpsertSourcePolicyApproval(row) {
    return {
        text: `insert into source_policy_approvals (
  id,
  fonte_id,
  stato,
  approvata_da,
  evidenza_url,
  nota
)
values ($1, $2, $3, $4, $5, $6)
on conflict (fonte_id) do update set
  stato = excluded.stato,
  approvata_da = excluded.approvata_da,
  evidenza_url = excluded.evidenza_url,
  nota = excluded.nota,
  aggiornata_il = now()`,
        values: [
            row.id,
            row.fonte_id,
            row.stato,
            row.approvata_da ?? null,
            row.evidenza_url ?? null,
            row.nota ?? null
        ]
    };
}
export class PostgresIngestJobRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async iniziaJob(input) {
        const command = comandoIniziaIngestJob(input);
        await this.database.query(command.text, command.values);
    }
    async completaJob(input) {
        const command = comandoCompletaIngestJob(input);
        await this.database.query(command.text, command.values);
    }
    async fallisceJob(input) {
        const command = comandoFallisceIngestJob(input);
        await this.database.query(command.text, command.values);
    }
    async registraFonte(row) {
        const command = comandoUpsertSourceCatalog(row);
        await this.database.query(command.text, command.values);
    }
    async registraRunFonte(row) {
        const command = comandoInserisciSourceRun(row);
        await this.database.query(command.text, command.values);
    }
}
export class PostgresLegalRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async upsertSnapshot(snapshot) {
        await this.database.query("begin");
        try {
            for (const command of generaComandiUpsertSnapshot(snapshot)) {
                await this.database.query(command.text, command.values);
            }
            await this.database.query("commit");
        }
        catch (error) {
            await this.database.query("rollback");
            throw error;
        }
    }
}
export class PostgresReviewRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async inserisci(row) {
        const command = comandoInserisciReviewQueue(row);
        await this.database.query(command.text, command.values);
    }
    async aggiornaStato(input) {
        const command = comandoAggiornaReviewQueue(input);
        await this.database.query(command.text, command.values);
    }
    async registraEvento(row) {
        const command = comandoInserisciReviewEvento(row);
        await this.database.query(command.text, command.values);
    }
    async lista(limite = 20) {
        const command = comandoListaReviewQueue(limite);
        const result = (await this.database.query(command.text, command.values));
        return (result.rows ?? []).map((row) => ({
            aggiornata_il: stringOrUndefined(row.aggiornata_il),
            assegnata_a: stringOrUndefined(row.assegnata_a) ?? null,
            creata_il: stringOrUndefined(row.creata_il),
            decisione: stringOrUndefined(row.decisione) ?? null,
            domanda: String(row.domanda),
            id: String(row.id),
            motivo: stringOrUndefined(row.motivo) ?? null,
            payload: asRecord(row.payload),
            priorita: parsePrioritaReviewQueue(row.priorita),
            risposta: String(row.risposta),
            rischio: parseRischioReviewQueue(row.rischio),
            scadenza_il: stringOrUndefined(row.scadenza_il) ?? null,
            stato: parseStatoReviewQueue(row.stato)
        }));
    }
}
export class PostgresDocumentRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    async inserisci(row) {
        const command = comandoInserisciDocumentoUtente(row);
        await this.database.query(command.text, command.values);
    }
    async lista(limite = 50) {
        const command = comandoListaDocumentiUtente(limite);
        const result = (await this.database.query(command.text, command.values));
        return (result.rows ?? []).map(mapDocumentoUtenteRow);
    }
    async leggi(id) {
        const command = comandoLeggiDocumentoUtente(id);
        const result = (await this.database.query(command.text, command.values));
        const row = result.rows?.[0];
        return row ? mapDocumentoUtenteRow(row) : null;
    }
}
function toPgVector(values) {
    return `[${values.map((value) => Number(value.toFixed(8))).join(",")}]`;
}
function parseStatoReviewQueue(value) {
    const stato = String(value);
    if (stato === "in_attesa" ||
        stato === "in_review" ||
        stato === "approvata" ||
        stato === "respinta" ||
        stato === "superata") {
        return stato;
    }
    return "in_attesa";
}
function parseRischioReviewQueue(value) {
    const rischio = String(value);
    if (rischio === "basso" || rischio === "medio" || rischio === "alto") {
        return rischio;
    }
    return "medio";
}
function parsePrioritaReviewQueue(value) {
    const priorita = String(value);
    if (priorita === "bassa" || priorita === "alta") {
        return priorita;
    }
    return "normale";
}
function mapDocumentoUtenteRow(row) {
    return {
        anteprima_testo: stringOrUndefined(row.anteprima_testo) ?? null,
        caricato_da: stringOrUndefined(row.caricato_da) ?? null,
        caricato_il: stringOrUndefined(row.caricato_il),
        content_type: String(row.content_type),
        dimensione_byte: Number(row.dimensione_byte),
        id: String(row.id),
        nome_file: String(row.nome_file),
        sha256: String(row.sha256),
        stato: parseStatoDocumentoUtente(row.stato),
        storage_uri: String(row.storage_uri)
    };
}
function parseStatoDocumentoUtente(value) {
    const stato = String(value);
    if (stato === "in_revisione" ||
        stato === "approvato" ||
        stato === "respinto") {
        return stato;
    }
    return "archiviato";
}
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
}
function stringOrUndefined(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }
    return typeof value === "string" && value.length > 0 ? value : undefined;
}
