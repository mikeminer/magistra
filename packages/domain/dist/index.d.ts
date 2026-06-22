export type ActType = "legge" | "decreto-legge" | "decreto-legislativo" | "codice" | "regolamento" | "trattato-ue" | "altro";
export type VersionStatus = "vigente" | "abrogata" | "originaria" | "storica";
export type StructuralUnitType = "articolo" | "comma" | "lettera" | "capo" | "titolo";
export type ReferenceType = "rinvio" | "modifica" | "abrogazione" | "recepimento-ue";
export type ReferenceExtractionSource = "akn-ref" | "testo-regex";
export type ReferenceResolutionStatus = "risolto" | "esterno" | "pendente";
export interface Norma {
    eli: string;
    tipoAtto: ActType;
    numero: string;
    data: string;
    titolo: string;
    fonte: string;
}
export interface Versione {
    id: string;
    normaEli: string;
    vigenzaDa: string;
    vigenzaA?: string;
    stato: VersionStatus;
}
export interface Manifestazione {
    id: string;
    versioneId: string;
    formato: "akn+xml" | "xml-nir" | "html" | "pdf" | "testo";
    urlFonte: string;
    sha256: string;
}
export interface ItemFonte {
    id: string;
    manifestazioneId: string;
    storageUri?: string;
    acquisitoIl?: string;
    dimensioneByte: number;
}
export interface Unita {
    id: string;
    versioneId: string;
    tipo: StructuralUnitType;
    numero: string;
    percorso: string;
    testo: string;
    eliUnita?: string;
}
export interface CitationMetadata {
    eli: string;
    fonte: string;
    tipoAtto: ActType;
    numeroAtto: string;
    dataAtto: string;
    articolo: string;
    comma?: string;
    vigenzaDa: string;
    vigenzaA?: string;
    urlFonte?: string;
    idArtefattoFonte?: string;
}
export interface Chunk {
    id: string;
    unitaId: string;
    testo: string;
    embedding?: readonly number[];
    metadati: CitationMetadata;
}
export interface Riferimento {
    daEli: string;
    aEli: string;
    tipo: ReferenceType;
    fonteEstrazione?: ReferenceExtractionSource;
    testoMatch?: string;
    confidenza?: number;
}
export interface CitationValidationResult {
    valid: boolean;
    missingFields: readonly string[];
}
export declare class CitationMetadataError extends Error {
    readonly missingFields: readonly string[];
    constructor(missingFields: readonly string[]);
}
export declare function validateCitationMetadata(metadata: Partial<CitationMetadata>): CitationValidationResult;
export declare function assertCitationMetadata(metadata: Partial<CitationMetadata>): asserts metadata is CitationMetadata;
export declare function createChunk(input: {
    id: string;
    unitaId: string;
    testo: string;
    embedding?: readonly number[];
    metadati: Partial<CitationMetadata>;
}): Chunk;
export declare function createCitationLabel(metadata: CitationMetadata): string;
export declare function isVersionActiveAt(versione: Versione, date: string): boolean;
//# sourceMappingURL=index.d.ts.map