export type TipoFonteEsterna = "normattiva" | "eur-lex" | "gazzetta-ufficiale" | "giurisprudenza";
export type RiusoFonte = "aperto" | "da-verificare" | "vietato";
export interface FonteEsterna {
    ambitoRiuso: string;
    descrizione: string;
    evidenzeRiuso: string[];
    frequenzaSuggerita: "giornaliera" | "settimanale" | "mensile" | "manuale";
    id: string;
    licenza: string;
    nome: string;
    riuso: RiusoFonte;
    tipo: TipoFonteEsterna;
    url: string;
}
export interface RichiestaFonte {
    fonteId: string;
    metodo: "GET";
    motivo: string;
    url: string;
}
export interface DocumentoFonteScaricato {
    contentType?: string;
    fonte: FonteEsterna;
    sourceUrl: string;
    xml: string;
}
export type FetchFonte = (url: string, init?: {
    body?: string;
    headers?: Record<string, string>;
    method?: "GET" | "POST";
}) => Promise<{
    headers?: {
        get(name: string): string | null;
    };
    ok: boolean;
    status: number;
    statusText: string;
    text(): Promise<string>;
}>;
export interface AdapterFonteEsterna {
    fonte: FonteEsterna;
    pianificaRichieste(seed?: string): RichiestaFonte[];
    validaRiuso(): {
        ok: boolean;
        motivo?: string;
    };
}
export declare class FonteConRiusoNonVerificatoError extends Error {
    readonly fonte: FonteEsterna;
    constructor(fonte: FonteEsterna);
}
export declare class NormattivaAdapter implements AdapterFonteEsterna {
    readonly fonte: FonteEsterna;
    pianificaRichieste(seed?: string): RichiestaFonte[];
    validaRiuso(): {
        ok: boolean;
    };
}
export declare class EurLexAdapter implements AdapterFonteEsterna {
    readonly fonte: FonteEsterna;
    pianificaRichieste(seed?: string): RichiestaFonte[];
    validaRiuso(): {
        ok: boolean;
    };
}
export declare class GazzettaUfficialeAdapter implements AdapterFonteEsterna {
    readonly fonte: FonteEsterna;
    pianificaRichieste(seed?: string): RichiestaFonte[];
    validaRiuso(): {
        ok: boolean;
    };
}
export declare class GiurisprudenzaApertaAdapter implements AdapterFonteEsterna {
    readonly fonte: FonteEsterna;
    pianificaRichieste(): RichiestaFonte[];
    validaRiuso(): {
        ok: boolean;
    };
}
export declare function creaRegistroFonti(): AdapterFonteEsterna[];
export declare function fontiCatalogabili(): {
    id: string;
    fonte: string;
    tipo: TipoFonteEsterna;
    url: string;
    licenza: string;
    riuso: RiusoFonte;
    stato: string;
    dettagli: {
        ambitoRiuso: string;
        descrizione: string;
        evidenzeRiuso: string[];
        frequenzaSuggerita: "giornaliera" | "settimanale" | "mensile" | "manuale";
        motivoRiuso: string | undefined;
    };
}[];
export declare function assertRiusoConsentito(adapter: AdapterFonteEsterna): void;
export declare function scaricaDocumentoAkomaNtoso(adapter: AdapterFonteEsterna, url: string, fetchImpl?: FetchFonte): Promise<DocumentoFonteScaricato>;
export declare function scaricaAttoNormattivaOpenData(adapter: NormattivaAdapter, urn: string, fetchImpl?: FetchFonte): Promise<DocumentoFonteScaricato>;
export declare function creaUrlNormattivaDaUrn(urn: string): string;
//# sourceMappingURL=index.d.ts.map