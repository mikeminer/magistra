import { type ActType, type Chunk, type CitationMetadata } from "@italian-oss-legal-platform/domain";
import { type CorpusNormativo } from "@italian-oss-legal-platform/ingest";
import { type EmbeddingProvider, type GeneratoreRisposta } from "@italian-oss-legal-platform/llm";
export interface FiltriRetrieval {
    annoAtto?: string;
    articolo?: string;
    comma?: string;
    fonte?: string;
    numeroAtto?: string;
    tipoAtto?: ActType;
    vigenzaAl?: string;
}
export interface OpzioniRetrieval {
    corpus?: CorpusNormativo;
    filtri?: FiltriRetrieval;
    limite?: number;
}
export interface RisultatoRetrieval {
    chunk: Chunk;
    label: string;
    modalita?: "lessicale" | "ibrida";
    punteggio: number;
    punteggioLessicale?: number;
    punteggioSemantico?: number;
    urlFonte?: string;
}
export interface CitazioneRisposta {
    eli: string;
    idArtefattoFonte?: string;
    label: string;
    urlFonte?: string;
}
export interface RiferimentoNormativoRecuperato {
    aEli: string;
    confidenza?: number;
    daEli: string;
    direzione: "in-uscita" | "in-entrata";
    fonteEstrazione?: "akn-ref" | "testo-regex";
    label: string;
    statoRisoluzione: "risolto" | "esterno" | "pendente";
    targetFonte?: string;
    targetRisolto: boolean;
    targetTitolo?: string;
    targetUrlFonte?: string;
    testoMatch?: string;
    tipo: "rinvio" | "modifica" | "abrogazione" | "recepimento-ue";
}
export interface FonteRecuperata {
    eli: string;
    id: string;
    label: string;
    metadati: CitationMetadata;
    modalita?: "lessicale" | "ibrida";
    punteggio: number;
    punteggioLessicale?: number;
    riferimentiNormativi?: RiferimentoNormativoRecuperato[];
    punteggioSemantico?: number;
    testo: string;
    urlFonte?: string;
}
export interface RispostaConFonti {
    avvertenza: string;
    citazioni: CitazioneRisposta[];
    domanda: string;
    fontiRecuperate: FonteRecuperata[];
    metriche?: {
        coperturaCitazioni: number;
        modelloRisposta?: string;
        providerEmbedding?: string;
        recuperoFontiOnline?: {
            errore?: string;
            jobId?: string;
            stato: "non-necessario" | "non-applicabile" | "tentato" | "riuscito" | "fallito";
            urns?: string[];
        };
        retrieval: "lessicale" | "ibrido";
        richiedeRevisioneUmana: boolean;
    };
    modalita: "deterministica" | "rag-locale";
    riferimentiNormativi?: RiferimentoNormativoRecuperato[];
    risposta: string;
    stato: "citata" | "senza-fonti";
}
export interface OpzioniRetrievalIbrido extends OpzioniRetrieval {
    embeddingProvider?: EmbeddingProvider;
}
export interface OpzioniRag extends OpzioniRetrievalIbrido {
    generatore?: GeneratoreRisposta;
}
export declare function getCorpusDimostrativo(): CorpusNormativo;
export declare function cercaCorpusLegale(domanda: string, options?: OpzioniRetrieval): RisultatoRetrieval[];
export declare function rispondiConFonti(domanda: string, options?: OpzioniRetrieval): RispostaConFonti;
export declare function preparaCorpusConEmbedding(corpus?: CorpusNormativo, provider?: EmbeddingProvider): Promise<CorpusNormativo>;
export declare function cercaCorpusLegaleIbrido(domanda: string, options?: OpzioniRetrievalIbrido): Promise<RisultatoRetrieval[]>;
export declare function rispondiConFontiRag(domanda: string, options?: OpzioniRag): Promise<RispostaConFonti>;
//# sourceMappingURL=index.d.ts.map