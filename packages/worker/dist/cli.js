import { applicaMigrazioni, creaDatabaseDaEnv, eseguiIngestNormattivaLocale, eseguiSchedulerIngest, leggiStatoIngestDaEnv } from "./index";
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
main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Errore worker inatteso.");
    process.exitCode = 1;
});
