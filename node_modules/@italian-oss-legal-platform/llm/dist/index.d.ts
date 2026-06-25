/// <reference types="node" />
import type { CitationMetadata } from "@italian-oss-legal-platform/domain";
export interface EmbeddingProvider {
    dimensioni: number;
    nome: string;
    generaEmbedding(input: string): Promise<readonly number[]>;
}
export interface FontePerGenerazione {
    eli: string;
    label: string;
    metadati: CitationMetadata;
    testo: string;
    urlFonte?: string;
}
export interface RichiestaGenerazione {
    domanda: string;
    fonti: readonly FontePerGenerazione[];
}
export interface RispostaGenerata {
    modello: string;
    testo: string;
}
export interface GeneratoreRisposta {
    nome: string;
    genera(richiesta: RichiestaGenerazione): Promise<RispostaGenerata>;
}
export declare class EmbeddingDeterministico implements EmbeddingProvider {
    readonly dimensioni: number;
    readonly nome = "stub-hash-1536";
    constructor(dimensioni?: number);
    generaEmbedding(input: string): Promise<readonly number[]>;
}
export declare class GeneratoreRispostaStub implements GeneratoreRisposta {
    readonly nome = "stub-citazionale";
    genera(richiesta: RichiestaGenerazione): Promise<RispostaGenerata>;
}
export interface OpenAICompatibleOptions {
    apiKey?: string;
    baseUrl?: string;
    model: string;
}
export type OpenAICompatibleApiFormat = "chat" | "responses";
export interface OpenAICompatibleGeneratoreOptions extends OpenAICompatibleOptions {
    apiFormat?: OpenAICompatibleApiFormat;
    maxOutputTokens?: number;
    temperature?: number;
}
export declare class OpenAICompatibleEmbeddingProvider implements EmbeddingProvider {
    private readonly options;
    readonly dimensioni: number;
    readonly nome: string;
    private readonly baseUrl;
    constructor(options: OpenAICompatibleOptions & {
        dimensioni?: number;
    });
    generaEmbedding(input: string): Promise<readonly number[]>;
}
export declare class OpenAICompatibleGeneratoreRisposta implements GeneratoreRisposta {
    private readonly options;
    readonly nome: string;
    private readonly apiFormat;
    private readonly baseUrl;
    private readonly maxOutputTokens;
    constructor(options: OpenAICompatibleGeneratoreOptions);
    genera(richiesta: RichiestaGenerazione): Promise<RispostaGenerata>;
    private generaConResponses;
    private generaConChatCompletions;
}
export interface IurexaGeneratoreOptions extends Omit<OpenAICompatibleGeneratoreOptions, "apiFormat"> {
}
export declare class IurexaGeneratoreRisposta extends OpenAICompatibleGeneratoreRisposta {
    readonly nome: string;
    constructor(options?: IurexaGeneratoreOptions);
}
export declare function creaEmbeddingProviderDaEnv(env?: NodeJS.ProcessEnv): EmbeddingProvider;
export declare function creaGeneratoreRispostaDaEnv(env?: NodeJS.ProcessEnv): GeneratoreRisposta;
export declare function similaritaCoseno(left: readonly number[], right: readonly number[]): number;
//# sourceMappingURL=index.d.ts.map
