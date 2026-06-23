/// <reference types="node" />
import { contaSnapshotDatabase, type QueryableDatabase } from "@italian-oss-legal-platform/database";
import { type FetchFonte } from "@italian-oss-legal-platform/sources";
export { creaDatabaseDaEnv, leggiStatoIngest, leggiStatoIngestDaEnv, type StatoIngestApi } from "./status.js";
export interface IngestWorkerOptions {
    database?: QueryableDatabase;
    env?: NodeJS.ProcessEnv;
    importaDatabase?: boolean;
    jobId?: string;
    migraPrima?: boolean;
    fetch?: FetchFonte;
}
export interface IngestWorkerResult {
    artefattiArchiviati: number;
    conteggi: ReturnType<typeof contaSnapshotDatabase>;
    importatoSuDatabase: boolean;
    jobId: string;
    providerEmbedding: string;
    corpusSostituito: boolean;
}
export interface SchedulerIngestResult {
    esecuzioni: number;
    intervalloSecondi: number;
    ultimoJobId?: string;
    ultimoRisultato?: IngestWorkerResult;
}
export interface OnlineRecoveryWorkerResult {
    artefattiArchiviati: number;
    chunkNormativi: number;
    conteggi: ReturnType<typeof contaSnapshotDatabase>;
    importatoSuDatabase: boolean;
    jobId: string;
    providerEmbedding: string;
    urns: string[];
}
export type ModalitaCorpusNormattiva = "corpus-locale" | "url-live" | "manifest-live" | "manifest-e-url-live";
export interface DocumentoManifestoNormattiva {
    ambito?: string;
    eli: string;
    id: string;
    motivo?: string;
    priorita?: string;
    statoPolicy?: string;
    titolo: string;
    urn?: string;
    url: string;
    versioni?: DocumentoVersioneManifestoNormattiva[];
}
export interface DocumentoVersioneManifestoNormattiva {
    id: string;
    stato: "vigente" | "abrogata" | "originaria" | "storica";
    titolo?: string;
    urn?: string;
    url?: string;
    vigenzaA?: string;
    vigenzaDa?: string;
}
export interface ManifestoCorpusNormattiva {
    descrizione?: string;
    documenti: DocumentoManifestoNormattiva[];
    fonte: "Normattiva";
    formato: "italian-oss-legal-platform.corpus-manifest.v1";
    id: string;
}
export interface SorgentiCorpusNormattiva {
    documentiManifesto: DocumentoManifestoNormattiva[];
    manifestId?: string;
    manifestPath?: string;
    modalita: ModalitaCorpusNormattiva;
    urns: string[];
    urls: string[];
}
export declare function eseguiIngestNormattivaLocale(options?: IngestWorkerOptions): Promise<IngestWorkerResult>;
export declare function eseguiSchedulerIngest(options?: IngestWorkerOptions & {
    signal?: AbortSignal;
}): Promise<SchedulerIngestResult>;
export declare function eseguiRecuperoOnlineNormattiva(urns: string[], options?: IngestWorkerOptions): Promise<OnlineRecoveryWorkerResult>;
export declare function applicaMigrazioni(database: QueryableDatabase, env?: NodeJS.ProcessEnv): Promise<string[]>;
export declare function leggiSorgentiNormattiva(env?: NodeJS.ProcessEnv): Promise<SorgentiCorpusNormattiva>;
export declare function leggiManifestoCorpusNormattiva(filePath: string): Promise<ManifestoCorpusNormattiva>;
//# sourceMappingURL=index.d.ts.map
