import type { CorpusNormativo } from "@italian-oss-legal-platform/ingest";
export interface NormaRow {
    eli: string;
    tipo_atto: string;
    numero: string;
    data_atto: string;
    titolo: string;
    fonte: string;
}
export interface VersioneRow {
    id: string;
    norma_eli: string;
    vigenza_da: string;
    vigenza_a: string | null;
    stato: string;
}
export interface UnitaNormativaRow {
    id: string;
    versione_id: string;
    tipo: string;
    numero: string;
    percorso: string;
    testo: string;
    eli_unita: string | null;
}
export interface ArtefattoFonteRow {
    id: string;
    fonte: string;
    formato: string;
    sha256: string;
    url_fonte: string;
    dimensione_byte: number;
}
export interface ManifestazioneRow {
    id: string;
    versione_id: string;
    formato: string;
    url_fonte: string;
    sha256: string;
}
export interface ItemFonteRow {
    id: string;
    manifestazione_id: string;
    storage_uri: string | null;
    dimensione_byte: number;
}
export interface ChunkNormativoRow {
    id: string;
    unita_id: string;
    artefatto_fonte_id: string | null;
    testo: string;
    embedding: readonly number[] | null;
    citation_eli: string;
    citation_fonte: string;
    citation_tipo_atto: string;
    citation_numero_atto: string;
    citation_data_atto: string;
    citation_articolo: string;
    citation_comma: string | null;
    citation_vigenza_da: string;
    citation_vigenza_a: string | null;
    citation_url_fonte: string | null;
}
export interface RiferimentoNormativoRow {
    da_eli: string;
    a_eli: string;
    tipo: string;
    confidenza: number;
    fonte_estrazione: "akn-ref" | "testo-regex";
    stato_risoluzione: "risolto" | "esterno" | "pendente";
    target_fonte: string | null;
    target_risolto: boolean;
    target_titolo: string | null;
    target_url_fonte: string | null;
    testo_match: string | null;
}
export interface SnapshotDatabase {
    norme: NormaRow[];
    versioni: VersioneRow[];
    unita_normative: UnitaNormativaRow[];
    artefatti_fonte: ArtefattoFonteRow[];
    manifestazioni: ManifestazioneRow[];
    items_fonte: ItemFonteRow[];
    chunk_normativi: ChunkNormativoRow[];
    riferimenti_normativi: RiferimentoNormativoRow[];
}
export interface ConteggiSnapshotDatabase {
    norme: number;
    versioni: number;
    unita_normative: number;
    artefatti_fonte: number;
    manifestazioni: number;
    items_fonte: number;
    chunk_normativi: number;
    riferimenti_normativi: number;
}
export interface SqlCommand {
    text: string;
    values: readonly unknown[];
}
export interface QueryableDatabase {
    query(text: string, values?: readonly unknown[]): Promise<unknown>;
}
export type StatoIngestJob = "in_corso" | "completato" | "fallito";
export interface IngestJobRow {
    id: string;
    fonte: string;
    stato: StatoIngestJob;
    iniziato_il: string;
    completato_il: string | null;
    errore: string | null;
    conteggi: Record<string, unknown>;
    dettagli: Record<string, unknown>;
}
export interface SourceCatalogRow {
    id: string;
    fonte: string;
    tipo: string;
    url: string;
    licenza: string;
    riuso: "aperto" | "da-verificare" | "vietato";
    stato: string;
    dettagli: Record<string, unknown>;
}
export interface SourceRunRow {
    id: string;
    job_id: string;
    fonte: string;
    url_fonte: string;
    stato: "acquisita" | "saltata" | "fallita";
    dettagli: Record<string, unknown>;
}
export type StatoReviewQueue = "in_attesa" | "in_review" | "approvata" | "respinta" | "superata";
export type RischioReviewQueue = "basso" | "medio" | "alto";
export interface ReviewQueueRow {
    aggiornata_il?: string;
    assegnata_a?: string | null;
    creata_il?: string;
    decisione?: string | null;
    domanda: string;
    id: string;
    motivo?: string | null;
    payload: Record<string, unknown>;
    priorita?: "bassa" | "normale" | "alta";
    risposta: string;
    rischio: RischioReviewQueue;
    scadenza_il?: string | null;
    stato: StatoReviewQueue;
}
export interface ReviewEventoRow {
    id: string;
    review_id: string;
    operatore: string;
    stato_da?: StatoReviewQueue | null;
    stato_a: StatoReviewQueue;
    nota?: string | null;
}
export interface DocumentoUtenteRow {
    anteprima_testo?: string | null;
    caricato_da?: string | null;
    caricato_il?: string;
    content_type: string;
    dimensione_byte: number;
    id: string;
    nome_file: string;
    sha256: string;
    stato: "archiviato" | "in_revisione" | "approvato" | "respinto";
    storage_uri: string;
}
export interface SourcePolicyApprovalRow {
    aggiornata_il?: string;
    approvata_da?: string | null;
    evidenza_url?: string | null;
    fonte_id: string;
    id: string;
    nota?: string | null;
    stato: "approvata" | "respinta" | "da-verificare";
}
export declare class SnapshotDatabaseError extends Error {
    readonly violazioni: readonly string[];
    constructor(violazioni: readonly string[]);
}
export declare function creaSnapshotDatabase(corpus: CorpusNormativo): SnapshotDatabase;
export declare function contaSnapshotDatabase(snapshot: SnapshotDatabase): ConteggiSnapshotDatabase;
export declare function validaSnapshotDatabase(snapshot: SnapshotDatabase): string[];
export declare function assertSnapshotDatabase(snapshot: SnapshotDatabase): void;
export declare function generaComandiUpsertSnapshot(snapshot: SnapshotDatabase): SqlCommand[];
export declare function comandoIniziaIngestJob(input: {
    dettagli?: Record<string, unknown>;
    fonte: string;
    id: string;
}): SqlCommand;
export declare function comandoCompletaIngestJob(input: {
    conteggi: Record<string, unknown>;
    dettagli?: Record<string, unknown>;
    id: string;
}): SqlCommand;
export declare function comandoFallisceIngestJob(input: {
    errore: string;
    id: string;
}): SqlCommand;
export declare function comandoUpsertSourceCatalog(row: SourceCatalogRow): SqlCommand;
export declare function comandoInserisciSourceRun(row: SourceRunRow): SqlCommand;
export declare function comandoInserisciReviewQueue(row: ReviewQueueRow): SqlCommand;
export declare function comandoAggiornaReviewQueue(input: {
    assegnataA?: string | null;
    decisione?: string | null;
    id: string;
    motivo?: string | null;
    stato: StatoReviewQueue;
}): SqlCommand;
export declare function comandoListaReviewQueue(limite?: number): SqlCommand;
export declare function comandoInserisciReviewEvento(row: ReviewEventoRow): SqlCommand;
export declare function comandoInserisciDocumentoUtente(row: DocumentoUtenteRow): SqlCommand;
export declare function comandoListaDocumentiUtente(limite?: number): SqlCommand;
export declare function comandoLeggiDocumentoUtente(id: string): SqlCommand;
export declare function comandoUpsertSourcePolicyApproval(row: SourcePolicyApprovalRow): SqlCommand;
export declare class PostgresIngestJobRepository {
    private readonly database;
    constructor(database: QueryableDatabase);
    iniziaJob(input: {
        dettagli?: Record<string, unknown>;
        fonte: string;
        id: string;
    }): Promise<void>;
    completaJob(input: {
        conteggi: Record<string, unknown>;
        dettagli?: Record<string, unknown>;
        id: string;
    }): Promise<void>;
    fallisceJob(input: {
        errore: string;
        id: string;
    }): Promise<void>;
    registraFonte(row: SourceCatalogRow): Promise<void>;
    registraRunFonte(row: SourceRunRow): Promise<void>;
}
export declare class PostgresLegalRepository {
    private readonly database;
    constructor(database: QueryableDatabase);
    upsertSnapshot(snapshot: SnapshotDatabase): Promise<void>;
}
export declare class PostgresReviewRepository {
    private readonly database;
    constructor(database: QueryableDatabase);
    inserisci(row: ReviewQueueRow): Promise<void>;
    aggiornaStato(input: {
        assegnataA?: string | null;
        decisione?: string | null;
        id: string;
        motivo?: string | null;
        stato: StatoReviewQueue;
    }): Promise<void>;
    registraEvento(row: ReviewEventoRow): Promise<void>;
    lista(limite?: number): Promise<ReviewQueueRow[]>;
}
export declare class PostgresDocumentRepository {
    private readonly database;
    constructor(database: QueryableDatabase);
    inserisci(row: DocumentoUtenteRow): Promise<void>;
    lista(limite?: number): Promise<DocumentoUtenteRow[]>;
    leggi(id: string): Promise<DocumentoUtenteRow | null>;
}
//# sourceMappingURL=index.d.ts.map