export interface CasoValutazione {
    articoloAtteso?: string;
    domanda: string;
    id: string;
    senzaFonti?: boolean;
    tipoAttoAtteso?: string;
}
export interface EsitoCasoValutazione {
    articoloAtteso?: string;
    articoloPrimoRisultato?: string;
    citazioneCorretta: boolean;
    domanda: string;
    id: string;
    primoRisultato?: string;
    statoRisposta: "citata" | "senza-fonti";
}
export interface ReportValutazione {
    casi: EsitoCasoValutazione[];
    metriche: {
        coperturaCitazioni: number;
        precisionePrimoRisultato: number;
        rifiutoNonSupportato: number;
    };
}
export declare const CASI_VALUTAZIONE_BASE: readonly CasoValutazione[];
export declare function valutaCasi(casi?: readonly CasoValutazione[]): Promise<ReportValutazione>;
//# sourceMappingURL=index.d.ts.map