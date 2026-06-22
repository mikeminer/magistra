import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { archiviaFontiCorpus, creaArchiviazioneOggettiDaEnv, creaManifestoIngest, parseCorpusNormattivaEsempio } from "./index";
const DEFAULT_OUTPUT = "artifacts/ingest/normattiva-corpus-esempio.json";
async function main() {
    const options = parseArgs(process.argv.slice(2));
    const workingDirectory = process.env.INIT_CWD ?? process.cwd();
    const outputPath = resolve(workingDirectory, options.out);
    const corpus = parseCorpusNormattivaEsempio();
    const manifesto = creaManifestoIngest(corpus);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(manifesto, null, 2)}\n`, "utf8");
    const archiviati = options.archiveSources
        ? await archiviaFontiCorpus(corpus, creaArchiviazioneOggettiDaEnv())
        : [];
    console.log([
        "Ingest del corpus Normattiva di esempio completato.",
        `Output: ${outputPath}`,
        `Norme: ${manifesto.conteggi.norme}`,
        `Artefatti fonte: ${manifesto.conteggi.artefatti}`,
        `Unità: ${manifesto.conteggi.unita}`,
        `Chunk: ${manifesto.conteggi.chunks}`,
        `Riferimenti: ${manifesto.conteggi.riferimenti}`,
        `Originali archiviati: ${archiviati.length}`
    ].join("\n"));
}
function parseArgs(args) {
    const options = {
        archiveSources: false,
        out: DEFAULT_OUTPUT
    };
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg && !arg.startsWith("--") && options.out === DEFAULT_OUTPUT) {
            options.out = arg;
            continue;
        }
        if (arg === "--archive-sources") {
            options.archiveSources = true;
            continue;
        }
        if (arg === "--out") {
            const value = args[index + 1];
            if (!value) {
                throw new Error("Il parametro --out richiede un percorso.");
            }
            options.out = value;
            index += 1;
            continue;
        }
        if (arg?.startsWith("--out=")) {
            options.out = arg.slice("--out=".length);
            continue;
        }
        throw new Error(`Parametro non riconosciuto: ${arg}`);
    }
    return options;
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : "Errore ingest inatteso.";
    console.error(message);
    process.exitCode = 1;
});
