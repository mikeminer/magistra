import { fontiCatalogabili } from "../../sources/dist/index.js";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
export async function leggiStatoIngestDaEnv(env = process.env) {
    if (!databaseConfigurato(env)) {
        return {
            catalogoFonti: arricchisciCatalogoFonti(new Map(), false),
            database: "non-configurato",
            stato: "non-configurato"
        };
    }
    const database = await creaDatabaseDaEnv(env);
    try {
        return await leggiStatoIngest(database);
    }
    finally {
        await database.end();
    }
}
export async function leggiStatoIngest(database) {
    let result;
    const catalogoFonti = await leggiCatalogoFontiOperativo(database);
    try {
        result = (await database.query(`select id, fonte, stato, iniziato_il, completato_il, errore, conteggi
from ingest_jobs
order by iniziato_il desc
limit 1`));
    }
    catch (error) {
        if (isMissingTableError(error)) {
            return {
                catalogoFonti: arricchisciCatalogoFonti(new Map(), true),
                database: "configurato",
                stato: "nessun-job"
            };
        }
        throw error;
    }
    const row = result.rows?.[0];
    if (!row) {
        return {
            catalogoFonti,
            database: "configurato",
            stato: "nessun-job"
        };
    }
    return {
        catalogoFonti,
        database: "configurato",
        job: {
            completatoIl: stringOrUndefined(row.completato_il),
            conteggi: asRecord(row.conteggi),
            errore: stringOrUndefined(row.errore),
            fonte: String(row.fonte),
            id: String(row.id),
            iniziatoIl: String(row.iniziato_il),
            stato: String(row.stato)
        },
        stato: "ok"
    };
}
async function leggiCatalogoFontiOperativo(database) {
    const conteggi = await leggiConteggiOperativiFonti(database);
    return arricchisciCatalogoFonti(conteggi, true);
}
async function leggiConteggiOperativiFonti(database) {
    const conteggi = new Map();
    try {
        const runs = (await database.query(`select fonte,
  count(*)::int as source_runs,
  max(acquisito_il) as ultimo_aggiornamento
from source_runs
where stato = 'acquisita'
group by fonte`));
        for (const row of runs.rows ?? []) {
            const fonte = String(row.fonte);
            conteggi.set(fonte, {
                ...conteggiDefault(),
                ...conteggi.get(fonte),
                sourceRuns: numberOrZero(row.source_runs),
                ultimoAggiornamento: stringOrUndefined(row.ultimo_aggiornamento)
            });
        }
        const chunks = (await database.query(`select citation_fonte as fonte, count(*)::int as chunk_normativi
from chunk_normativi
group by citation_fonte`));
        for (const row of chunks.rows ?? []) {
            const fonte = String(row.fonte);
            conteggi.set(fonte, {
                ...conteggiDefault(),
                ...conteggi.get(fonte),
                chunkNormativi: numberOrZero(row.chunk_normativi)
            });
        }
        const errori = (await database.query(`select fonte, errore, iniziato_il as fallito_il
from ingest_jobs
where stato = 'fallito' and errore is not null
order by iniziato_il desc`));
        const erroriFonti = (await database.query(`select fonte, dettagli->>'errore' as errore, acquisito_il as fallito_il
from source_runs
where stato = 'fallita' and dettagli ? 'errore'
order by acquisito_il desc`));
        for (const row of [...(errori.rows ?? []), ...(erroriFonti.rows ?? [])]) {
            const fonte = String(row.fonte);
            const precedente = conteggi.get(fonte) ?? conteggiDefault();
            const fallitoIl = stringOrUndefined(row.fallito_il);
            if (!precedente.ultimoErrore &&
                errorePiuRecenteDellUltimaAcquisizione(fallitoIl, precedente.ultimoAggiornamento)) {
                conteggi.set(fonte, {
                    ...precedente,
                    ultimoErrore: stringOrUndefined(row.errore)
                });
            }
        }
    }
    catch (error) {
        if (isMissingTableError(error)) {
            return new Map();
        }
        throw error;
    }
    return conteggi;
}
function arricchisciCatalogoFonti(conteggi, databaseConfigurato) {
    return fontiCatalogabili().map((fonte) => {
        const operativo = conteggi.get(fonte.fonte) ?? conteggiDefault();
        const stato = determinaStatoOperativoFonte(operativo, databaseConfigurato);
        return {
            ...fonte,
            statoOperativo: {
                ...operativo,
                descrizione: descriviStatoOperativoFonte(stato),
                stato
            }
        };
    });
}
function determinaStatoOperativoFonte(conteggi, databaseConfigurato) {
    if (!databaseConfigurato) {
        return "non-configurata";
    }
    if (conteggi.chunkNormativi > 0) {
        return "indicizzata";
    }
    if (conteggi.sourceRuns > 0) {
        return "non-indicizzata";
    }
    if (conteggi.ultimoErrore) {
        return "errore";
    }
    return "catalogata";
}
function descriviStatoOperativoFonte(stato) {
    if (stato === "indicizzata") {
        return "Fonte indicizzata e interrogabile.";
    }
    if (stato === "non-indicizzata") {
        return "Fonte acquisita, ma non ancora disponibile nella ricerca.";
    }
    if (stato === "errore") {
        return "Ultimo aggiornamento non riuscito.";
    }
    if (stato === "non-configurata") {
        return "Archivio non configurato.";
    }
    return "Fonte catalogata, non ancora indicizzata.";
}
function conteggiDefault() {
    return {
        chunkNormativi: 0,
        sourceRuns: 0
    };
}
function errorePiuRecenteDellUltimaAcquisizione(fallitoIl, ultimoAggiornamento) {
    if (!fallitoIl || !ultimoAggiornamento) {
        return true;
    }
    return new Date(fallitoIl).getTime() > new Date(ultimoAggiornamento).getTime();
}
export async function creaDatabaseDaEnv(env = process.env) {
    const driver = databaseDriverDaEnv(env);
    if (driver === "pglite") {
        return creaPgliteDatabaseDaEnv(env);
    }
    if (driver === "none") {
        throw new Error("Database non configurato: impostare DATABASE_URL o MAGISTRA_DB_DRIVER=pglite.");
    }
    const connectionString = env.DATABASE_URL;
    const client = new pg.Client({
        connectionString
    });
    await client.connect();
    return client;
}
export function databaseConfigurato(env = process.env) {
    return databaseDriverDaEnv(env) !== "none";
}
export function databaseDriverDaEnv(env = process.env) {
    const driver = String(env.MAGISTRA_DB_DRIVER ?? env.DATABASE_DRIVER ?? "").toLowerCase();
    if (driver === "pglite" || env.PGLITE_DATA_DIR || env.MAGISTRA_PGLITE_DATA_DIR) {
        return "pglite";
    }
    if (env.DATABASE_URL) {
        return "postgres";
    }
    return "none";
}
export function isPgliteDatabase(database) {
    return Boolean(database &&
        typeof database === "object" &&
        database.magistraDriver === "pglite");
}
async function creaPgliteDatabaseDaEnv(env) {
    const dataDir = env.PGLITE_DATA_DIR ?? env.MAGISTRA_PGLITE_DATA_DIR;
    const client = dataDir ? new PGlite(dataDir) : new PGlite();
    return new PgliteQueryableDatabase(client, dataDir);
}
class PgliteQueryableDatabase {
    client;
    dataDir;
    magistraDriver = "pglite";
    constructor(client, dataDir) {
        this.client = client;
        this.dataDir = dataDir;
    }
    async query(text, values = []) {
        return this.client.query(normalizzaSqlPerPglite(text), [...values]);
    }
    async exec(text) {
        return this.client.exec(normalizzaSqlPerPglite(text));
    }
    async end() {
        await this.client.close?.();
    }
}
export function normalizzaSqlPerPglite(text) {
    return text
        .replace(/create\s+extension\s+if\s+not\s+exists\s+vector\s*;?/gi, "")
        .replace(/\bembedding\s+vector\s*\(\s*\d+\s*\)/gi, "embedding text")
        .replace(/::\s*vector\b/gi, "")
        .replace(/\bpublic\./g, "");
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
function numberOrZero(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}
function isMissingTableError(error) {
    if (!error || typeof error !== "object") {
        return false;
    }
    const record = error;
    return record.code === "42P01" || String(record.message ?? "").includes("ingest_jobs");
}
