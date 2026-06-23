/// <reference types="node" />
/// <reference types="node" />
import type { CorpusNormativo } from "./index.js";
export interface OggettoArchiviato {
    bucket?: string;
    chiave: string;
    dimensioneByte: number;
    sha256: string;
    uri: string;
}
export interface SalvaArtefattoInput {
    body: string | Buffer;
    bucket?: string;
    chiave: string;
    contentType: string;
    metadati?: Record<string, string>;
}
export interface ArchiviazioneOggetti {
    salvaArtefatto(input: SalvaArtefattoInput): Promise<OggettoArchiviato>;
}
export interface FileSystemObjectStorageOptions {
    baseDir: string;
}
export declare class FileSystemObjectStorage implements ArchiviazioneOggetti {
    private readonly options;
    constructor(options: FileSystemObjectStorageOptions);
    salvaArtefatto(input: SalvaArtefattoInput): Promise<OggettoArchiviato>;
}
export interface S3ObjectStorageOptions {
    accessKeyId: string;
    bucket: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    region: string;
    secretAccessKey: string;
}
export declare class S3ObjectStorage implements ArchiviazioneOggetti {
    private readonly options;
    private readonly client;
    constructor(options: S3ObjectStorageOptions);
    salvaArtefatto(input: SalvaArtefattoInput): Promise<OggettoArchiviato>;
}
export declare function creaArchiviazioneOggettiDaEnv(env?: NodeJS.ProcessEnv): ArchiviazioneOggetti;
export declare function archiviaFontiCorpus(corpus: CorpusNormativo, storage: ArchiviazioneOggetti): Promise<OggettoArchiviato[]>;
//# sourceMappingURL=storage.d.ts.map
