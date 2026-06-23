import { applicaMigrazioni, creaDatabaseDaEnv, eseguiIngestNormattivaLocale, eseguiRecuperoOnlineNormattiva, eseguiSchedulerIngest, leggiStatoIngestDaEnv } from "./index.js";
async function main() {
    const command = process.argv[2] ?? "ingest-once";
    if (command === "migrate") {
        const database = await creaDatabaseDaEnv();
        try {
            const applied = await applicaMigrazioni(database);
            console.log(applied.length > 0
                ? `Migrazioni applicate: ${applied.join(", ")}`
                : "Migrazioni già aggiornate.");
        }
        finally {
            await database.end();
        }
        return;
    }
    if (command === "status") {
        console.log(JSON.stringify(await leggiStatoIngestDaEnv(), null, 2));
        return;
    }
    if (command === "ingest-once") {
        const result = await eseguiIngestNormattivaLocale({
            importaDatabase: process.env.WORKER_IMPORT_DATABASE !== "false",
            migraPrima: process.env.WORKER_MIGRATE_BEFORE_INGEST !== "false"
        });
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    if (command === "recover-online") {
        const urns = leggiUrnRecuperoOnline();
        const result = await eseguiRecuperoOnlineNormattiva(urns, {
            importaDatabase: process.env.WORKER_IMPORT_DATABASE !== "false",
            migraPrima: process.env.WORKER_MIGRATE_BEFORE_ONLINE_RECOVERY === "true"
        });
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    if (command === "schedule") {
        const result = await eseguiSchedulerIngest({
            importaDatabase: process.env.WORKER_IMPORT_DATABASE !== "false",
            migraPrima: process.env.WORKER_MIGRATE_BEFORE_INGEST !== "false"
        });
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    throw new Error(`Comando worker non riconosciuto: ${command}`);
}
function leggiUrnRecuperoOnline() {
    const daArgomenti = process.argv.slice(3);
    const daEnv = process.env.ONLINE_RECOVERY_URNS
        ? JSON.parse(process.env.ONLINE_RECOVERY_URNS)
        : [];
    const urns = [
        ...daArgomenti,
        ...(Array.isArray(daEnv) ? daEnv : String(daEnv).split(/[\n;,]+/))
    ]
        .map((value) => String(value).trim())
        .filter(Boolean);
    return [...new Set(urns)];
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Errore worker inatteso.");
    process.exitCode = 1;
});
