/// <reference types="node" />
import type { QueryableDatabase } from "@italian-oss-legal-platform/database";
export interface StatoIngestApi {
    catalogoFonti: Array<{
        dettagli: {
            ambitoRiuso: string;
            descrizione: string;
            evidenzeRiuso: string[];
            frequenzaSuggerita: string;
            motivoRiuso?: string;
        };
        fonte: string;
        id: string;
        licenza: string;
        riuso: string;
        stato: string;
        statoOperativo: {
            chunkNormativi: number;
            descrizione: string;
            sourceRuns: number;
            stato: "catalogata" | "errore" | "indicizzata" | "non-configurata" | "non-indicizzata";
            ultimoAggiornamento?: string;
            ultimoErrore?: string;
        };
        tipo: string;
        url: string;
    }>;
    database: "configurato" | "non-configurato";
    job?: {
        completatoIl?: string;
        conteggi: Record<string, unknown>;
        errore?: string;
        fonte: string;
        id: string;
        iniziatoIl: string;
        stato: string;
    };
    stato: "ok" | "non-configurato" | "nessun-job";
}
export declare function leggiStatoIngestDaEnv(env?: NodeJS.ProcessEnv): Promise<StatoIngestApi>;
export declare function leggiStatoIngest(database: QueryableDatabase): Promise<StatoIngestApi>;
export declare function creaDatabaseDaEnv(env?: NodeJS.ProcessEnv): Promise<import("pg").Client>;
//# sourceMappingURL=status.d.ts.map