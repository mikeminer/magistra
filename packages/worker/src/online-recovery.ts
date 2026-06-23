import { createHash, randomUUID } from "node:crypto";
import {
  PostgresIngestJobRepository,
  PostgresLegalRepository,
  comandoUpsertSourceCatalog,
  comandoUpsertSourcePolicyApproval,
  contaSnapshotDatabase,
  creaSnapshotDatabase,
  type QueryableDatabase
} from "@italian-oss-legal-platform/database";
import {
  archiviaFontiCorpus,
  creaArchiviazioneOggettiDaEnv,
  parseDocumentiAkomaNtoso,
  type OggettoArchiviato
} from "@italian-oss-legal-platform/ingest";
import { creaEmbeddingProviderDaEnv } from "@italian-oss-legal-platform/llm";
import {
  NormattivaAdapter,
  fontiCatalogabili,
  scaricaAttoNormattivaOpenData,
  type FetchFonte
} from "@italian-oss-legal-platform/sources";
import { creaDatabaseDaEnv } from "../dist/status.js";
import { applicaMigrazioni } from "../dist/index.js";

export interface OnlineRecoveryWorkerOptions {
  database?: QueryableDatabase;
  env?: NodeJS.ProcessEnv;
  fetch?: FetchFonte;
  importaDatabase?: boolean;
  jobId?: string;
  migraPrima?: boolean;
}

export async function eseguiRecuperoOnlineNormattiva(
  urns: string[],
  options: OnlineRecoveryWorkerOptions = {}
) {
  const env = options.env ?? process.env;
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL non configurata: impossibile importare fonti online.");
  }

  const database = options.database ?? (await creaDatabaseDaEnv(env));
  const jobId = options.jobId ?? `online-recovery:${new Date().toISOString()}:${randomUUID()}`;
  const jobRepository = new PostgresIngestJobRepository(database);
  const urnsUniche = [...new Set(urns.map((value) => value.trim()).filter(Boolean))];
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
        stato: "vigente" as const,
        xml: scaricato.xml
      });
    }

    const embeddingProvider = creaEmbeddingProviderDaEnv(env);
    const corpus = parseDocumentiAkomaNtoso(documenti);
    const chunks = await Promise.all(
      corpus.chunks.map(async (chunk) => ({
        ...chunk,
        embedding: chunk.embedding ?? (await embeddingProvider.generaEmbedding(chunk.testo))
      }))
    );
    const corpusConEmbedding = { ...corpus, chunks };
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
  } catch (error) {
    await jobRepository.fallisceJob({
      errore: error instanceof Error ? error.message : "Recupero online non gestito.",
      id: jobId
    });
    throw error;
  } finally {
    if (!options.database && database && "end" in database && typeof database.end === "function") {
      await (database as QueryableDatabase & { end(): Promise<void> }).end();
    }
  }
}

function hashBreve(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 12);
}

async function registraCatalogoFonti(database: QueryableDatabase): Promise<void> {
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

async function registraApprovazioniPolicyFonti(database: QueryableDatabase): Promise<void> {
  for (const fonte of fontiCatalogabili()) {
    const evidenze = fonte.dettagli.evidenzeRiuso;
    const stato =
      fonte.stato === "abilitata"
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
        fonte.dettagli.ambitoRiuso,
        evidenze.length > 1 ? `Evidenze: ${evidenze.join(" | ")}` : undefined
      ]
        .filter(Boolean)
        .join(" - "),
      stato
    });
    await database.query(command.text, command.values);
  }
}

async function registraSourceRuns(
  database: QueryableDatabase,
  jobId: string,
  documentiFonte: Array<{
    artefatto: {
      fonte: string;
      sha256: string;
      urlFonte: string;
    };
    nomeFile: string;
  }>,
  artefatti: OggettoArchiviato[]
): Promise<void> {
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
