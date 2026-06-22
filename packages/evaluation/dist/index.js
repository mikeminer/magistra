import { cercaCorpusLegaleIbrido, rispondiConFontiRag } from "@italian-oss-legal-platform/retrieval";
export const CASI_VALUTAZIONE_BASE = [
    {
        articoloAtteso: "3",
        domanda: "Che cosa deve indicare la motivazione di un provvedimento amministrativo?",
        id: "motivazione-provvedimento",
        tipoAttoAtteso: "legge"
    },
    {
        articoloAtteso: "5",
        domanda: "Quando si può chiedere accesso civico a dati e documenti?",
        id: "accesso-civico",
        tipoAttoAtteso: "decreto-legislativo"
    },
    {
        articoloAtteso: "2043",
        domanda: "Chi risponde del danno ingiusto secondo il codice civile?",
        id: "danno-ingiusto",
        tipoAttoAtteso: "codice"
    },
    {
        articoloAtteso: "288",
        domanda: "Perché il regolamento UE è direttamente applicabile negli Stati membri?",
        id: "regolamento-ue-applicabilita-diretta",
        tipoAttoAtteso: "trattato-ue"
    },
    {
        articoloAtteso: "6",
        domanda: "Entro quando posso impugnare un licenziamento?",
        id: "impugnazione-licenziamento",
        tipoAttoAtteso: "legge"
    },
    {
        articoloAtteso: "5",
        domanda: "Che cosa significa il principio la legge non ammette ignoranza?",
        id: "ignoranza-legge-penale",
        tipoAttoAtteso: "altro"
    },
    {
        articoloAtteso: "2",
        domanda: "Quanto dura un contratto di locazione?",
        id: "durata-locazione",
        tipoAttoAtteso: "legge"
    },
    {
        domanda: "Quali sono le previsioni meteo di domani?",
        id: "domanda-non-giuridica",
        senzaFonti: true
    }
];
export async function valutaCasi(casi = CASI_VALUTAZIONE_BASE) {
    const esiti = [];
    for (const caso of casi) {
        const risultati = await cercaCorpusLegaleIbrido(caso.domanda);
        const risposta = await rispondiConFontiRag(caso.domanda);
        const primo = risultati[0];
        const citazioneCorretta = caso.senzaFonti
            ? risposta.stato === "senza-fonti"
            : Boolean(primo &&
                primo.chunk.metadati.articolo === caso.articoloAtteso &&
                primo.chunk.metadati.tipoAtto === caso.tipoAttoAtteso);
        esiti.push({
            articoloAtteso: caso.articoloAtteso,
            articoloPrimoRisultato: primo?.chunk.metadati.articolo,
            citazioneCorretta,
            domanda: caso.domanda,
            id: caso.id,
            primoRisultato: primo?.label,
            statoRisposta: risposta.stato
        });
    }
    return {
        casi: esiti,
        metriche: {
            coperturaCitazioni: media(esiti.map((esito) => (esito.statoRisposta === "citata" || esito.citazioneCorretta ? 1 : 0))),
            precisionePrimoRisultato: media(esiti
                .filter((esito) => esito.articoloAtteso)
                .map((esito) => (esito.citazioneCorretta ? 1 : 0))),
            rifiutoNonSupportato: media(esiti
                .filter((esito) => !esito.articoloAtteso)
                .map((esito) => (esito.statoRisposta === "senza-fonti" ? 1 : 0)))
        }
    };
}
function media(values) {
    if (values.length === 0) {
        return 0;
    }
    return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2));
}
