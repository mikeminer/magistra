import { createCitationLabel, isVersionActiveAt } from "@italian-oss-legal-platform/domain";
import { parseCorpusDimostrativo } from "@italian-oss-legal-platform/ingest";
import { EmbeddingDeterministico, GeneratoreRispostaStub, similaritaCoseno } from "@italian-oss-legal-platform/llm";
const STOP_WORDS = new Set([
    "a",
    "ad",
    "ai",
    "al",
    "alla",
    "allo",
    "anche",
    "che",
    "chi",
    "con",
    "da",
    "dei",
    "del",
    "della",
    "di",
    "e",
    "gli",
    "ha",
    "i",
    "il",
    "in",
    "la",
    "le",
    "lo",
    "nel",
    "nella",
    "non",
    "o",
    "per",
    "piu",
    "quali",
    "qual",
    "un",
    "una"
]);
const SEGNALI_GIURIDICI = new Set([
    "accesso",
    "affitto",
    "affitti",
    "amministrativa",
    "amministrativo",
    "anticorruzione",
    "articolo",
    "atto",
    "civico",
    "codice",
    "comma",
    "concorrenza",
    "contratti",
    "contratto",
    "contribuente",
    "corruzione",
    "danno",
    "dati",
    "decreto",
    "decisione",
    "direttamente",
    "direttiva",
    "digitale",
    "diritti",
    "diritto",
    "enti",
    "europea",
    "europeo",
    "eur",
    "giurisdizione",
    "ignoranza",
    "ignorare",
    "impiego",
    "impugnare",
    "impugnazione",
    "lavoratori",
    "lavoro",
    "licenziamenti",
    "licenziamento",
    "legge",
    "locazione",
    "locazioni",
    "motivazione",
    "norma",
    "normativa",
    "obblighi",
    "penale",
    "procedimento",
    "prova",
    "provvedimento",
    "pubblici",
    "pubblico",
    "pubblicita",
    "regolamento",
    "responsabilita",
    "ricorso",
    "sanzioni",
    "segnalazioni",
    "sicurezza",
    "stati",
    "tfue",
    "trattato",
    "trasparenza",
    "ue",
    "unione",
    "vigenza",
    "whistleblowing"
]);
let corpusDimostrativo = null;
export function getCorpusDimostrativo() {
    corpusDimostrativo ??= parseCorpusDimostrativo();
    return corpusDimostrativo;
}
export function cercaCorpusLegale(domanda, options = {}) {
    const corpus = options.corpus ?? getCorpusDimostrativo();
    const limite = options.limite ?? 3;
    const filtri = inferisciFiltri(domanda, options.filtri);
    const domandaTokens = tokenizza(domanda);
    if (domandaTokens.length === 0) {
        return [];
    }
    if (!haFiltriStrutturati(filtri) && !haSegnaliGiuridici(domandaTokens)) {
        return [];
    }
    const risultati = corpus.chunks
        .filter((chunk) => passaFiltri(chunk, corpus, filtri))
        .map((chunk) => ({
        chunk,
        label: createCitationLabel(chunk.metadati),
        modalita: "lessicale",
        punteggio: calcolaPunteggio(domanda, domandaTokens, chunk),
        urlFonte: chunk.metadati.urlFonte
    }))
        .filter((result) => result.punteggio >= punteggioLessicaleMinimo(filtri))
        .sort((left, right) => right.punteggio - left.punteggio);
    const migliorPunteggio = risultati[0]?.punteggio ?? 0;
    const soglia = migliorPunteggio <= 2 ? 1 : Math.max(2, Math.ceil(migliorPunteggio * 0.35));
    return risultati.filter((result) => result.punteggio >= soglia).slice(0, limite);
}
export function rispondiConFonti(domanda, options = {}) {
    const risultati = cercaCorpusLegale(domanda, options);
    if (risultati.length === 0) {
        return {
            avvertenza: "Informazione generale: il sistema non sostituisce consulenza legale.",
            citazioni: [],
            domanda,
            fontiRecuperate: [],
            metriche: {
                coperturaCitazioni: 0,
                retrieval: "lessicale",
                richiedeRevisioneUmana: false
            },
            modalita: "deterministica",
            risposta: "Non ho recuperato fonti normative sufficienti per rispondere in modo citabile. Riformula la domanda indicando norma, articolo o tema giuridico più specifico.",
            stato: "senza-fonti"
        };
    }
    const fontiRecuperate = risultati.map(formattaFonteRecuperata);
    const sintesiFonti = fontiRecuperate
        .map((fonte, index) => `${index + 1}. ${fonte.testo}`)
        .join(" ");
    return {
        avvertenza: "Risposta informativa basata solo sulle fonti recuperate; non è consulenza legale.",
        citazioni: fontiRecuperate.map((fonte) => ({
            eli: fonte.eli,
            idArtefattoFonte: fonte.metadati.idArtefattoFonte,
            label: fonte.label,
            urlFonte: fonte.urlFonte
        })),
        domanda,
        fontiRecuperate,
        metriche: {
            coperturaCitazioni: fontiRecuperate.length > 0 ? 1 : 0,
            retrieval: "lessicale",
            richiedeRevisioneUmana: richiedeRevisioneUmana(domanda)
        },
        modalita: "deterministica",
        risposta: `Le fonti recuperate indicano quanto segue. ${sintesiFonti} Le citazioni elencate riportano norma, articolo, comma e vigenza usati per costruire questa risposta.`,
        stato: "citata"
    };
}
export async function preparaCorpusConEmbedding(corpus = getCorpusDimostrativo(), provider = new EmbeddingDeterministico()) {
    const chunks = await Promise.all(corpus.chunks.map(async (chunk) => ({
        ...chunk,
        embedding: chunk.embedding ?? (await provider.generaEmbedding(chunk.testo))
    })));
    return {
        ...corpus,
        chunks
    };
}
export async function cercaCorpusLegaleIbrido(domanda, options = {}) {
    const provider = options.embeddingProvider ?? new EmbeddingDeterministico();
    const corpus = await preparaCorpusConEmbedding(options.corpus ?? getCorpusDimostrativo(), provider);
    const limite = options.limite ?? 4;
    const filtri = inferisciFiltri(domanda, options.filtri);
    const domandaTokens = tokenizza(domanda);
    if (domandaTokens.length === 0) {
        return [];
    }
    if (!haFiltriStrutturati(filtri) && !haSegnaliGiuridici(domandaTokens)) {
        return [];
    }
    const domandaEmbedding = await provider.generaEmbedding(domanda);
    const risultati = corpus.chunks
        .filter((chunk) => passaFiltri(chunk, corpus, filtri))
        .map((chunk) => {
        const lessicale = calcolaPunteggio(domanda, domandaTokens, chunk);
        const semantico = chunk.embedding
            ? Math.max(0, similaritaCoseno(domandaEmbedding, chunk.embedding))
            : 0;
        const punteggio = lessicale * 1.4 + semantico * 6;
        return {
            chunk,
            label: createCitationLabel(chunk.metadati),
            modalita: "ibrida",
            punteggio: arrotondaPunteggio(punteggio),
            punteggioLessicale: arrotondaPunteggio(lessicale),
            punteggioSemantico: arrotondaPunteggio(semantico),
            urlFonte: chunk.metadati.urlFonte
        };
    })
        .filter((result) => superaRilevanzaMinima(result, filtri))
        .sort((left, right) => right.punteggio - left.punteggio);
    const migliorPunteggio = risultati[0]?.punteggio ?? 0;
    const soglia = migliorPunteggio <= 2 ? 0.5 : Math.max(1, migliorPunteggio * 0.28);
    return risultati.filter((result) => result.punteggio >= soglia).slice(0, limite);
}
export async function rispondiConFontiRag(domanda, options = {}) {
    const embeddingProvider = options.embeddingProvider ?? new EmbeddingDeterministico();
    const generatore = options.generatore ?? new GeneratoreRispostaStub();
    const risultati = await cercaCorpusLegaleIbrido(domanda, {
        ...options,
        embeddingProvider
    });
    if (risultati.length === 0) {
        return {
            avvertenza: "Informazione generale: il sistema non sostituisce consulenza legale.",
            citazioni: [],
            domanda,
            fontiRecuperate: [],
            metriche: {
                coperturaCitazioni: 0,
                modelloRisposta: generatore.nome,
                providerEmbedding: embeddingProvider.nome,
                retrieval: "ibrido",
                richiedeRevisioneUmana: false
            },
            modalita: "rag-locale",
            risposta: "Non ho recuperato fonti normative sufficienti per rispondere in modo citabile. Riformula la domanda indicando norma, articolo, fonte o tema giuridico più specifico.",
            stato: "senza-fonti"
        };
    }
    const fontiRecuperate = risultati.map(formattaFonteRecuperata);
    const generata = await generatore.genera({
        domanda,
        fonti: fontiRecuperate.map((fonte) => ({
            eli: fonte.eli,
            label: fonte.label,
            metadati: fonte.metadati,
            testo: fonte.testo,
            urlFonte: fonte.urlFonte
        }))
    });
    return {
        avvertenza: "Risposta informativa basata solo sulle fonti recuperate; non è consulenza legale.",
        citazioni: fontiRecuperate.map((fonte) => ({
            eli: fonte.eli,
            idArtefattoFonte: fonte.metadati.idArtefattoFonte,
            label: fonte.label,
            urlFonte: fonte.urlFonte
        })),
        domanda,
        fontiRecuperate,
        metriche: {
            coperturaCitazioni: calcolaCoperturaCitazioni(fontiRecuperate),
            modelloRisposta: generata.modello,
            providerEmbedding: embeddingProvider.nome,
            retrieval: "ibrido",
            richiedeRevisioneUmana: richiedeRevisioneUmana(domanda)
        },
        modalita: "rag-locale",
        risposta: generata.testo,
        stato: "citata"
    };
}
function inferisciFiltri(domanda, filtri = {}) {
    const articoloMatch = domanda.match(/\bart(?:icolo)?\.?\s+(\d+(?:[-\s]?[a-z]+)?)\b/i);
    const domandaNormalizzata = normalizza(domanda);
    const concetto = inferisciConcettoNormativo(domandaNormalizzata);
    return {
        ...concetto,
        ...filtri,
        articolo: filtri.articolo ??
            articoloMatch?.[1]?.replace(/\s+/g, "-").toLowerCase() ??
            concetto.articolo,
        comma: filtri.comma ?? concetto.comma
    };
}
function passaFiltri(chunk, corpus, filtri) {
    if (filtri.articolo && chunk.metadati.articolo !== filtri.articolo) {
        return false;
    }
    if (filtri.comma && chunk.metadati.comma !== filtri.comma) {
        return false;
    }
    if (filtri.fonte && chunk.metadati.fonte !== filtri.fonte) {
        return false;
    }
    if (filtri.numeroAtto && chunk.metadati.numeroAtto !== filtri.numeroAtto) {
        return false;
    }
    if (filtri.annoAtto && !chunk.metadati.dataAtto.startsWith(filtri.annoAtto)) {
        return false;
    }
    if (filtri.tipoAtto && chunk.metadati.tipoAtto !== filtri.tipoAtto) {
        return false;
    }
    const versione = trovaVersioneChunk(chunk, corpus);
    if (filtri.vigenzaAl && !isVersionActiveAt(versione, filtri.vigenzaAl)) {
        return false;
    }
    return true;
}
function haFiltriStrutturati(filtri) {
    return Boolean(filtri.annoAtto ||
        filtri.articolo ||
        filtri.comma ||
        filtri.fonte ||
        filtri.numeroAtto ||
        filtri.tipoAtto);
}
function punteggioLessicaleMinimo(filtri) {
    return haFiltriStrutturati(filtri) ? 1 : 2;
}
function haSegnaliGiuridici(tokens) {
    return tokens.some((token) => SEGNALI_GIURIDICI.has(token));
}
function superaRilevanzaMinima(result, filtri) {
    if (haFiltriStrutturati(filtri)) {
        return (result.punteggioLessicale ?? 0) >= 1 || result.punteggioSemantico === undefined;
    }
    const lessicale = result.punteggioLessicale ?? result.punteggio;
    const semantico = result.punteggioSemantico ?? 0;
    return lessicale >= 2 || (lessicale >= 1 && semantico >= 0.35);
}
function calcolaPunteggio(domanda, domandaTokens, chunk) {
    const testoChunk = tokenizza(`${chunk.testo} ${chunk.metadati.articolo} ${chunk.metadati.comma ?? ""}`);
    const tokenSet = new Set(testoChunk);
    const uniqueQueryTokens = [...new Set(domandaTokens)];
    let score = uniqueQueryTokens.reduce((total, token) => total + (tokenSet.has(token) ? 1 : 0), 0);
    const domandaNormalizzata = normalizza(domanda);
    if (domandaNormalizzata.includes("motivazione") &&
        chunk.metadati.articolo === "3") {
        score += 4;
    }
    if (domandaNormalizzata.includes("accesso") && chunk.metadati.articolo === "22") {
        score += 4;
    }
    if (domandaNormalizzata.includes("accesso civico") &&
        chunk.metadati.tipoAtto === "decreto-legislativo") {
        score += 5;
    }
    if (domandaNormalizzata.includes("danno ingiusto") &&
        chunk.metadati.articolo === "2043") {
        score += 5;
    }
    if (domandaNormalizzata.includes("onere della prova") &&
        chunk.metadati.articolo === "2697") {
        score += 5;
    }
    if (isDomandaSuApplicabilitaRegolamentoUe(domandaNormalizzata) &&
        chunk.metadati.tipoAtto === "trattato-ue" &&
        chunk.metadati.articolo === "288") {
        score += chunk.metadati.comma === "2" ? 14 : 7;
    }
    if (isDomandaSuImpugnazioneLicenziamento(domandaNormalizzata) &&
        chunk.metadati.tipoAtto === "legge" &&
        chunk.metadati.numeroAtto === "604" &&
        chunk.metadati.articolo === "6") {
        score += chunk.metadati.comma === "1" ? 18 : 14;
    }
    if (isDomandaSuIgnoranzaLeggePenale(domandaNormalizzata) &&
        chunk.metadati.numeroAtto === "1398" &&
        chunk.metadati.articolo === "5") {
        score += 20;
    }
    if (isDomandaSuDurataLocazione(domandaNormalizzata)) {
        if (chunk.metadati.numeroAtto === "431" && chunk.metadati.articolo === "2") {
            score += chunk.metadati.comma === "1" ? 22 : 18;
        }
        if (chunk.metadati.numeroAtto === "392" && chunk.metadati.articolo === "27") {
            score += domandaNormalizzata.includes("commercial") ||
                domandaNormalizzata.includes("albergh")
                ? 22
                : 12;
        }
        if (chunk.metadati.numeroAtto === "392" && chunk.metadati.articolo === "28") {
            score += domandaNormalizzata.includes("rinnov") ? 16 : 8;
        }
    }
    if (domandaNormalizzata.includes("procedimento") &&
        chunk.metadati.articolo === "2") {
        score += 3;
    }
    return score;
}
function inferisciConcettoNormativo(domandaNormalizzata) {
    if (isDomandaSuApplicabilitaRegolamentoUe(domandaNormalizzata)) {
        return {
            articolo: "288",
            comma: "2",
            tipoAtto: "trattato-ue"
        };
    }
    if (isDomandaSuImpugnazioneLicenziamento(domandaNormalizzata)) {
        return {
            articolo: "6",
            tipoAtto: "legge"
        };
    }
    if (isDomandaSuIgnoranzaLeggePenale(domandaNormalizzata)) {
        return {
            annoAtto: "1930",
            articolo: "5",
            numeroAtto: "1398"
        };
    }
    return {};
}
function isDomandaSuApplicabilitaRegolamentoUe(domandaNormalizzata) {
    return (domandaNormalizzata.includes("regolamento") &&
        (domandaNormalizzata.includes("ue") ||
            domandaNormalizzata.includes("unione europea") ||
            domandaNormalizzata.includes("tfue") ||
            domandaNormalizzata.includes("stati membri")) &&
        (domandaNormalizzata.includes("applicabile") ||
            domandaNormalizzata.includes("direttamente") ||
            domandaNormalizzata.includes("portata generale")));
}
function isDomandaSuImpugnazioneLicenziamento(domandaNormalizzata) {
    return (domandaNormalizzata.includes("licenziament") &&
        (domandaNormalizzata.includes("impugn") ||
            domandaNormalizzata.includes("entro quanto") ||
            domandaNormalizzata.includes("entro quando") ||
            domandaNormalizzata.includes("termine") ||
            domandaNormalizzata.includes("termini") ||
            domandaNormalizzata.includes("giorni") ||
            domandaNormalizzata.includes("decadenza") ||
            domandaNormalizzata.includes("contestare")));
}
function isDomandaSuIgnoranzaLeggePenale(domandaNormalizzata) {
    return (domandaNormalizzata.includes("la legge non ammette ignoranza") ||
        domandaNormalizzata.includes("ignorantia legis") ||
        ((domandaNormalizzata.includes("ignoranza") ||
            domandaNormalizzata.includes("ignorare")) &&
            (domandaNormalizzata.includes("legge") ||
                domandaNormalizzata.includes("penale") ||
                domandaNormalizzata.includes("scusa"))));
}
function isDomandaSuDurataLocazione(domandaNormalizzata) {
    const parlaDiLocazione = domandaNormalizzata.includes("locazione") ||
        domandaNormalizzata.includes("locazioni") ||
        domandaNormalizzata.includes("affitto") ||
        domandaNormalizzata.includes("affitti") ||
        domandaNormalizzata.includes("contratto di casa") ||
        domandaNormalizzata.includes("contratto casa") ||
        domandaNormalizzata.includes("canone concordato");
    const chiedeDurata = domandaNormalizzata.includes("quanto dura") ||
        domandaNormalizzata.includes("durata") ||
        domandaNormalizzata.includes("anni") ||
        domandaNormalizzata.includes("scadenza") ||
        domandaNormalizzata.includes("rinnovo") ||
        domandaNormalizzata.includes("rinnov");
    return parlaDiLocazione && chiedeDurata;
}
function formattaFonteRecuperata(result) {
    return {
        eli: result.chunk.metadati.eli,
        id: result.chunk.id,
        label: result.label,
        metadati: result.chunk.metadati,
        modalita: result.modalita,
        punteggio: result.punteggio,
        punteggioLessicale: result.punteggioLessicale,
        punteggioSemantico: result.punteggioSemantico,
        testo: result.chunk.testo,
        urlFonte: result.urlFonte
    };
}
function trovaVersioneChunk(chunk, corpus) {
    const unita = corpus.unita.find((item) => item.id === chunk.unitaId);
    const versione = corpus.versioni.find((item) => item.id === unita?.versioneId);
    return versione ?? corpus.versione;
}
function calcolaCoperturaCitazioni(fonti) {
    if (fonti.length === 0) {
        return 0;
    }
    const citabili = fonti.filter((fonte) => fonte.urlFonte || fonte.metadati.idArtefattoFonte);
    return Number((citabili.length / fonti.length).toFixed(2));
}
function richiedeRevisioneUmana(domanda) {
    const normalized = normalizza(domanda);
    return [
        "penale",
        "reato",
        "licenziamento",
        "risarcimento",
        "danno",
        "impugnare",
        "responsabilita",
        "contratto"
    ].some((token) => normalized.includes(token));
}
function arrotondaPunteggio(value) {
    return Number(value.toFixed(4));
}
function tokenizza(input) {
    return normalizza(input)
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}
function normalizza(input) {
    return input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
