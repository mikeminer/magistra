/// <reference types="node" />
import { type RispostaConFonti } from "@italian-oss-legal-platform/retrieval";
export interface ApiResult<TBody = unknown> {
    body: TBody;
    status: number;
}
interface ReviewQueueRequest {
    citazioni?: unknown;
    domanda?: string;
    fontiRecuperate?: unknown;
    metriche?: {
        richiedeRevisioneUmana?: boolean;
    };
    risposta?: string;
}
interface UpdateReviewRequest {
    assegnataA?: string;
    decisione?: string;
    motivo?: string;
    operatore?: string;
    stato?: string;
}
interface DocumentoUploadRequest {
    caricatoDa?: string;
    contentType?: string;
    contenutoBase64?: string;
    nomeFile?: string;
}
export declare function rispondiConFonti(domanda: string, env?: NodeJS.ProcessEnv): Promise<RispostaConFonti>;
export declare function rispondiConFontiDatabase(domanda: string, env?: NodeJS.ProcessEnv): Promise<RispostaConFonti | null>;
export declare function leggiFonte(id: string, env?: NodeJS.ProcessEnv): Promise<ApiResult>;
export declare function leggiReviewQueue(env?: NodeJS.ProcessEnv, adminToken?: string): Promise<ApiResult>;
export declare function aggiornaReview(id: string, body: UpdateReviewRequest | null, env?: NodeJS.ProcessEnv, adminToken?: string): Promise<ApiResult>;
export declare function accodaReview(body: ReviewQueueRequest | null, env?: NodeJS.ProcessEnv): Promise<ApiResult>;
export declare function listaDocumentiUtente(env?: NodeJS.ProcessEnv, adminToken?: string): Promise<ApiResult>;
export declare function leggiDocumentoUtente(id: string, env?: NodeJS.ProcessEnv, adminToken?: string): Promise<ApiResult>;
export declare function salvaDocumentoUtente(body: DocumentoUploadRequest | null, env?: NodeJS.ProcessEnv, adminToken?: string): Promise<ApiResult>;
export declare function pianificaUrnNormattivaPerRecupero(domanda: string): string[];
export {};
