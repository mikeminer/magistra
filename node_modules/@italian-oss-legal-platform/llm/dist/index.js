import { createHash } from "node:crypto";
const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
export class EmbeddingDeterministico {
    dimensioni;
    nome = "stub-hash-1536";
    constructor(dimensioni = DEFAULT_EMBEDDING_DIMENSIONS) {
        this.dimensioni = dimensioni;
    }
    async generaEmbedding(input) {
        return creaEmbeddingHash(input, this.dimensioni);
    }
}
export class GeneratoreRispostaStub {
    nome = "stub-citazionale";
    async genera(richiesta) {
        if (richiesta.fonti.length === 0) {
            return {
                modello: this.nome,
                testo: "Non ho fonti normative sufficienti per formulare una risposta citabile."
            };
        }
        const punti = richiesta.fonti
            .slice(0, 3)
            .map((fonte, index) => {
            const testo = tronca(fonte.testo, 420);
            return `${index + 1}. ${testo} [${fonte.label}]`;
        })
            .join(" ");
        return {
            modello: this.nome,
            testo: `In base alle fonti recuperate, la risposta informativa è questa: ${punti} Le citazioni associate indicano gli articoli, i commi e la vigenza usati per sostenere la risposta.`
        };
    }
}
export class OpenAICompatibleEmbeddingProvider {
    options;
    dimensioni;
    nome;
    baseUrl;
    constructor(options) {
        this.options = options;
        this.dimensioni = options.dimensioni ?? DEFAULT_EMBEDDING_DIMENSIONS;
        this.nome = `openai-compatible:${options.model}`;
        this.baseUrl = trimTrailingSlash(nonEmpty(options.baseUrl) ?? "https://api.openai.com/v1");
    }
    async generaEmbedding(input) {
        const response = await fetch(`${this.baseUrl}/embeddings`, {
            body: JSON.stringify({
                input,
                model: this.options.model
            }),
            headers: {
                ...authorizationHeader(this.options.apiKey),
                "content-type": "application/json"
            },
            method: "POST"
        });
        if (!response.ok) {
            throw new Error(`Provider embedding remoto non disponibile: ${response.status}`);
        }
        const payload = (await response.json());
        const embedding = payload.data?.[0]?.embedding;
        if (!Array.isArray(embedding) || !embedding.every((value) => typeof value === "number")) {
            throw new Error("Risposta embedding remota non valida.");
        }
        return embedding;
    }
}
export class OpenAICompatibleGeneratoreRisposta {
    options;
    nome;
    apiFormat;
    baseUrl;
    maxOutputTokens;
    constructor(options) {
        this.options = options;
        this.apiFormat = options.apiFormat ?? "responses";
        this.maxOutputTokens = options.maxOutputTokens ?? 700;
        this.nome =
            this.apiFormat === "chat"
                ? `openai-compatible-chat:${options.model}`
                : `openai-compatible:${options.model}`;
        this.baseUrl = trimTrailingSlash(nonEmpty(options.baseUrl) ?? "https://api.openai.com/v1");
    }
    async genera(richiesta) {
        const text = this.apiFormat === "chat"
            ? await this.generaConChatCompletions(richiesta)
            : await this.generaConResponses(richiesta);
        return {
            modello: this.nome,
            testo: text
        };
    }
    async generaConResponses(richiesta) {
        const body = compactObject({
            input: creaPromptCitazionale(richiesta),
            max_output_tokens: this.maxOutputTokens,
            model: this.options.model,
            temperature: this.options.temperature
        });
        const response = await fetch(`${this.baseUrl}/responses`, {
            body: JSON.stringify(body),
            headers: {
                ...authorizationHeader(this.options.apiKey),
                "content-type": "application/json"
            },
            method: "POST"
        });
        if (!response.ok) {
            throw new Error(`Provider LLM remoto non disponibile: ${response.status}`);
        }
        const payload = (await response.json());
        const text = payload.output_text ?? estraiOutputText(payload.output);
        if (!text) {
            throw new Error("Risposta LLM remota priva di testo.");
        }
        return garantisciCitazioniRecuperate(text, richiesta);
    }
    async generaConChatCompletions(richiesta) {
        const body = compactObject({
            max_tokens: this.maxOutputTokens,
            messages: creaMessaggiCitazionali(richiesta),
            model: this.options.model,
            temperature: this.options.temperature
        });
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            body: JSON.stringify(body),
            headers: {
                ...authorizationHeader(this.options.apiKey),
                "content-type": "application/json"
            },
            method: "POST"
        });
        if (!response.ok) {
            throw new Error(`Provider LLM remoto non disponibile: ${response.status}`);
        }
        const payload = (await response.json());
        const text = estraiChatCompletionsText(payload.choices);
        if (!text) {
            throw new Error("Risposta LLM remota priva di testo.");
        }
        return garantisciCitazioniRecuperate(text, richiesta);
    }
}
export function creaEmbeddingProviderDaEnv(env = process.env) {
    const provider = env.EMBEDDING_PROVIDER ?? "stub";
    if (provider === "stub") {
        return new EmbeddingDeterministico();
    }
    if (provider === "openai") {
        return new OpenAICompatibleEmbeddingProvider({
            apiKey: requireEnv(env, "OPENAI_API_KEY"),
            baseUrl: env.OPENAI_BASE_URL,
            dimensioni: Number(env.OPENAI_EMBEDDING_DIMENSIONS ?? DEFAULT_EMBEDDING_DIMENSIONS),
            model: env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small"
        });
    }
    throw new Error(`Provider embedding non supportato: ${provider}`);
}
export function creaGeneratoreRispostaDaEnv(env = process.env) {
    const provider = env.LLM_PROVIDER ?? "stub";
    const maxOutputTokens = numberFromEnv(env.LLM_MAX_OUTPUT_TOKENS, 700);
    const temperature = optionalNumberFromEnv(env.LLM_TEMPERATURE);
    if (provider === "stub") {
        return new GeneratoreRispostaStub();
    }
    if (provider === "openai") {
        return new OpenAICompatibleGeneratoreRisposta({
            apiFormat: parseApiFormat(env.LLM_API_FORMAT, "responses"),
            apiKey: requireEnv(env, "OPENAI_API_KEY"),
            baseUrl: nonEmpty(env.OPENAI_BASE_URL),
            maxOutputTokens,
            model: nonEmpty(env.OPENAI_RESPONSE_MODEL) ?? nonEmpty(env.LLM_MODEL) ?? "gpt-5.5",
            temperature
        });
    }
    if (provider === "openai-compatible") {
        return new OpenAICompatibleGeneratoreRisposta({
            apiFormat: parseApiFormat(env.LLM_API_FORMAT, "chat"),
            apiKey: nonEmpty(env.LLM_API_KEY) ?? nonEmpty(env.OPENAI_API_KEY),
            baseUrl: nonEmpty(env.LLM_BASE_URL) ?? nonEmpty(env.OPENAI_BASE_URL),
            maxOutputTokens,
            model: nonEmpty(env.LLM_MODEL) ??
                nonEmpty(env.OPENAI_RESPONSE_MODEL) ??
                "hermes-3-llama-3.1-8b",
            temperature
        });
    }
    if (provider === "ollama") {
        return new OpenAICompatibleGeneratoreRisposta({
            apiFormat: parseApiFormat(env.LLM_API_FORMAT, "chat"),
            apiKey: nonEmpty(env.OLLAMA_API_KEY) ??
                nonEmpty(env.LLM_API_KEY) ??
                nonEmpty(env.OPENAI_API_KEY),
            baseUrl: nonEmpty(env.OLLAMA_BASE_URL) ??
                nonEmpty(env.LLM_BASE_URL) ??
                nonEmpty(env.OPENAI_BASE_URL) ??
                "http://localhost:11434/v1",
            maxOutputTokens,
            model: nonEmpty(env.OLLAMA_MODEL) ??
                nonEmpty(env.LLM_MODEL) ??
                nonEmpty(env.OPENAI_RESPONSE_MODEL) ??
                "hermes3",
            temperature
        });
    }
    throw new Error(`Provider LLM non supportato: ${provider}`);
}
export function similaritaCoseno(left, right) {
    const length = Math.min(left.length, right.length);
    let dot = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    for (let index = 0; index < length; index += 1) {
        const leftValue = left[index] ?? 0;
        const rightValue = right[index] ?? 0;
        dot += leftValue * rightValue;
        leftNorm += leftValue * leftValue;
        rightNorm += rightValue * rightValue;
    }
    if (leftNorm === 0 || rightNorm === 0) {
        return 0;
    }
    return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}
function creaEmbeddingHash(input, dimensioni) {
    const vector = new Array(dimensioni).fill(0);
    for (const token of tokenizza(input)) {
        const digest = createHash("sha256").update(token).digest();
        const index = digest.readUInt32BE(0) % dimensioni;
        const sign = digest[4] && digest[4] % 2 === 0 ? 1 : -1;
        const weight = 1 + Math.min(token.length, 16) / 16;
        vector[index] += sign * weight;
    }
    const norm = Math.sqrt(vector.reduce((total, value) => total + value * value, 0));
    if (norm === 0) {
        return vector;
    }
    return vector.map((value) => Number((value / norm).toFixed(8)));
}
function tokenizza(input) {
    return input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 2);
}
function tronca(input, length) {
    if (input.length <= length) {
        return input;
    }
    return `${input.slice(0, length - 1).trim()}...`;
}
function creaPromptCitazionale(richiesta) {
    return [
        CREA_SYSTEM_PROMPT_CITAZIONALE,
        creaPromptUtenteCitazionale(richiesta)
    ].join("\n\n");
}
const CREA_SYSTEM_PROMPT_CITAZIONALE = [
    "Sei un assistente di ricerca giuridica italiana.",
    "Il tuo compito e trasformare fonti normative recuperate in una risposta chiara, breve e verificabile.",
    "Usa esclusivamente le fonti fornite: non aggiungere norme, date, soggetti o interpretazioni non presenti nelle fonti.",
    "Se le fonti sono schede OpenGA, trattale come metadati giurisprudenziali e non come motivazioni integrali: non dedurre orientamenti di merito non esplicitati.",
    "Non usare virgolette e non presentare come citazione testuale parole che non sono identiche alla fonte.",
    "Non copiare lunghi passaggi testuali: sintetizza in italiano comprensibile.",
    "Ogni affermazione giuridica rilevante deve citare una fonte con il formato [F1], [F2], ecc.",
    "Se le fonti non bastano, dillo esplicitamente e spiega quale informazione manca.",
    "Non fornire consulenza legale personalizzata e non suggerire azioni processuali specifiche.",
    "Rispondi in 4-8 frasi, con eventuale elenco puntato solo se rende la risposta piu leggibile."
].join(" ");
function creaMessaggiCitazionali(richiesta) {
    return [
        {
            content: CREA_SYSTEM_PROMPT_CITAZIONALE,
            role: "system"
        },
        {
            content: creaPromptUtenteCitazionale(richiesta),
            role: "user"
        }
    ];
}
function creaPromptUtenteCitazionale(richiesta) {
    const fonti = richiesta.fonti
        .map((fonte, index) => [
        `[F${index + 1}] ${fonte.label}`,
        `ELI: ${fonte.eli}`,
        fonte.metadati.vigenzaDa
            ? `Vigenza: dal ${fonte.metadati.vigenzaDa}${fonte.metadati.vigenzaA ? ` al ${fonte.metadati.vigenzaA}` : ""}`
            : undefined,
        fonte.urlFonte ? `URL: ${fonte.urlFonte}` : undefined,
        `Testo fonte: ${tronca(fonte.testo, 1400)}`
    ]
        .filter((line) => typeof line === "string")
        .join("\n"))
        .join("\n\n");
    return [
        `Domanda: ${richiesta.domanda}`,
        `Fonti:\n${fonti}`
    ].join("\n\n");
}
function estraiOutputText(output = []) {
    return output
        .flatMap((item) => item.content ?? [])
        .filter((content) => content.type === "output_text" || typeof content.text === "string")
        .map((content) => content.text)
        .filter((text) => typeof text === "string" && text.length > 0)
        .join("\n")
        .trim();
}
function estraiChatCompletionsText(choices = []) {
    return choices
        .map((choice) => choice.message?.content)
        .map((content) => {
        if (typeof content === "string") {
            return content;
        }
        if (Array.isArray(content)) {
            return content
                .map((part) => typeof part === "object" &&
                part !== null &&
                "text" in part &&
                typeof part.text === "string"
                ? part.text
                : "")
                .join("");
        }
        return "";
    })
        .join("\n")
        .trim();
}
function garantisciCitazioniRecuperate(testo, richiesta) {
    const fontiDisponibili = new Set(richiesta.fonti.map((_, index) => `F${index + 1}`));
    const testoSenzaCitazioniInventate = testo
        .replace(/\[F(\d+)\]/g, (match, rawIndex) => fontiDisponibili.has(`F${rawIndex}`) ? match : "")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\s+([,.;:])/g, "$1")
        .trim();
    if (contieneSoloSchedeOpenGa(richiesta)) {
        return creaRispostaControllataOpenGa(richiesta);
    }
    if (contieneCitazioneTestualeNonSupportata(testoSenzaCitazioniInventate, richiesta)) {
        return creaRispostaControllataDaFonti(richiesta);
    }
    if (contieneIdentificativoEuropeoSospetto(testoSenzaCitazioniInventate, richiesta)) {
        return creaRispostaControllataDaFonti(richiesta);
    }
    if (ometteTerminiImpugnazioneLicenziamento(testoSenzaCitazioniInventate, richiesta)) {
        return creaRispostaControllataImpugnazioneLicenziamento(richiesta);
    }
    if (isDomandaSuDurataLocazione(richiesta)) {
        return creaRispostaControllataDurataLocazione(richiesta);
    }
    const citazioniUsate = new Set([...testoSenzaCitazioniInventate.matchAll(/\[F(\d+)\]/g)].map((match) => `F${match[1]}`));
    if (citazioniUsate.size > 0 || richiesta.fonti.length === 0) {
        return testoSenzaCitazioniInventate;
    }
    const fonti = richiesta.fonti
        .slice(0, 3)
        .map((fonte, index) => `[F${index + 1}] ${fonte.label}`)
        .join("; ");
    return `${testoSenzaCitazioniInventate}\n\nFonti usate: ${fonti}.`;
}
function ometteTerminiImpugnazioneLicenziamento(testoGenerato, richiesta) {
    const domanda = normalizzaPerConfronto(richiesta.domanda);
    const testo = normalizzaPerConfronto(testoGenerato);
    const fonteRilevante = richiesta.fonti.some((fonte) => {
        const fonteTesto = normalizzaPerConfronto(fonte.testo);
        return (fonte.metadati.fonte === "Normattiva" &&
            fonte.metadati.tipoAtto === "legge" &&
            fonte.metadati.numeroAtto === "604" &&
            fonte.metadati.articolo === "6" &&
            fonteTesto.includes("sessanta giorni") &&
            (fonteTesto.includes("centottanta giorni") || fonteTesto.includes("180 giorni")));
    });
    return (fonteRilevante &&
        domanda.includes("licenziament") &&
        (domanda.includes("impugn") || domanda.includes("entro quando")) &&
        !(testo.includes("centottanta giorni") || testo.includes("180 giorni")));
}
function creaRispostaControllataImpugnazioneLicenziamento(richiesta) {
    const index = richiesta.fonti.findIndex((fonte) => fonte.metadati.fonte === "Normattiva" &&
        fonte.metadati.tipoAtto === "legge" &&
        fonte.metadati.numeroAtto === "604" &&
        fonte.metadati.articolo === "6");
    const marker = `[F${index >= 0 ? index + 1 : 1}]`;
    return [
        "L'art. 6 della legge 604/1966 distingue piu termini.",
        `Il licenziamento va impugnato, a pena di decadenza, entro sessanta giorni dalla comunicazione scritta del licenziamento o dei motivi se comunicati separatamente ${marker}.`,
        `L'impugnazione diventa inefficace se nei successivi centottanta giorni non segue il deposito del ricorso al tribunale del lavoro o la comunicazione alla controparte della richiesta di conciliazione o arbitrato ${marker}.`,
        `Se conciliazione o arbitrato sono rifiutati, o non si raggiunge l'accordo necessario, il ricorso al giudice deve essere depositato entro sessanta giorni dal rifiuto o dal mancato accordo ${marker}.`
    ].join(" ");
}
function isDomandaSuDurataLocazione(richiesta) {
    const domanda = normalizzaPerConfronto(richiesta.domanda);
    const parlaDiLocazione = domanda.includes("locazione") ||
        domanda.includes("affitto") ||
        domanda.includes("contratto di casa") ||
        domanda.includes("canone concordato");
    const chiedeDurata = domanda.includes("quanto dura") ||
        domanda.includes("durata") ||
        domanda.includes("anni") ||
        domanda.includes("scadenza") ||
        domanda.includes("rinnovo");
    return parlaDiLocazione && chiedeDurata;
}
function creaRispostaControllataDurataLocazione(richiesta) {
    const markerAbitativa = markerFonte(richiesta, (fonte) => fonte.metadati.numeroAtto === "431" &&
        fonte.metadati.articolo === "2" &&
        fonte.metadati.comma === "1");
    const markerConcordata = markerFonte(richiesta, (fonte) => fonte.metadati.numeroAtto === "431" &&
        fonte.metadati.articolo === "2" &&
        fonte.metadati.comma === "3");
    const markerUsoDiverso = markerFonte(richiesta, (fonte) => fonte.metadati.numeroAtto === "392" &&
        fonte.metadati.articolo === "27" &&
        fonte.metadati.comma === "1");
    const markerAlberghiera = markerFonte(richiesta, (fonte) => fonte.metadati.numeroAtto === "392" &&
        fonte.metadati.articolo === "27" &&
        fonte.metadati.comma === "2");
    const markerDurataLegale = markerFonte(richiesta, (fonte) => fonte.metadati.numeroAtto === "392" &&
        fonte.metadati.articolo === "27" &&
        fonte.metadati.comma === "4");
    return [
        "Dipende dal tipo di locazione.",
        markerAbitativa
            ? `Per la locazione abitativa ordinaria la durata non puo essere inferiore a quattro anni, con rinnovo per altri quattro anni nei casi previsti dalla legge ${markerAbitativa}.`
            : undefined,
        markerConcordata
            ? `Per il contratto abitativo a canone concordato la durata minima e di tre anni, con proroga di diritto per due anni alla prima scadenza salvo i casi previsti dalla legge ${markerConcordata}.`
            : undefined,
        markerUsoDiverso
            ? `Per immobili adibiti ad attivita industriali, commerciali, artigianali o di interesse turistico la durata minima e di sei anni ${markerUsoDiverso}.`
            : undefined,
        markerAlberghiera
            ? `Per immobili adibiti ad attivita alberghiere o assimilate la durata minima e di nove anni ${markerAlberghiera}.`
            : undefined,
        markerDurataLegale
            ? `Se le parti indicano una durata inferiore o non la indicano, opera la durata legale prevista per quel tipo di locazione ${markerDurataLegale}.`
            : undefined
    ]
        .filter(Boolean)
        .join(" ");
}
function markerFonte(richiesta, predicate) {
    const index = richiesta.fonti.findIndex(predicate);
    return index >= 0 ? `[F${index + 1}]` : undefined;
}
function contieneIdentificativoEuropeoSospetto(testo, richiesta) {
    const identificativiConsentiti = new Set(richiesta.fonti
        .flatMap((fonte) => [
        fonte.eli,
        fonte.label,
        fonte.metadati.numeroAtto,
        `${fonte.metadati.numeroAtto}/${fonte.metadati.dataAtto}`
    ])
        .map(normalizzaPerConfronto)
        .filter((value) => value.length > 0));
    const identificativiGenerati = [
        ...testo.matchAll(/\b\d{4}\/E\d+\b/gi),
        ...testo.matchAll(/\b\d{4}E\d+\/\d{4}\b/gi)
    ];
    return identificativiGenerati.some((match) => {
        const identificativo = normalizzaPerConfronto(match[0] ?? "");
        return identificativo.length > 0 && !identificativiConsentiti.has(identificativo);
    });
}
function contieneCitazioneTestualeNonSupportata(testo, richiesta) {
    const fonteNormalizzata = normalizzaPerConfronto(richiesta.fonti.map((fonte) => fonte.testo).join(" "));
    const citazioni = [
        ...testo.matchAll(/"([^"]{12,})"/g),
        ...testo.matchAll(/“([^”]{12,})”/g),
        ...testo.matchAll(/«([^»]{12,})»/g)
    ];
    return citazioni.some((match) => {
        const citazione = normalizzaPerConfronto(match[1] ?? "");
        return citazione.length > 0 && !fonteNormalizzata.includes(citazione);
    });
}
function contieneSoloSchedeOpenGa(richiesta) {
    return (richiesta.fonti.length > 0 &&
        richiesta.fonti.every((fonte) => fonte.metadati.fonte === "OpenGA - Giustizia Amministrativa" &&
            fonte.testo.includes("Scheda giurisprudenziale OpenGA")));
}
function creaRispostaControllataOpenGa(richiesta) {
    const punti = richiesta.fonti.slice(0, 3).map((fonte, index) => {
        const esito = estraiCampoSchedaOpenGa(fonte.testo, "Esito");
        const oggetto = estraiCampoSchedaOpenGa(fonte.testo, "Oggetto del ricorso");
        const tipoRicorso = estraiCampoSchedaOpenGa(fonte.testo, "Tipo ricorso");
        const dettagli = [
            esito ? `esito: ${esito}` : undefined,
            oggetto ? `oggetto: ${oggetto}` : undefined,
            tipoRicorso ? `rito/tipo: ${tipoRicorso}` : undefined
        ]
            .filter(Boolean)
            .join("; ");
        return `${fonte.label}: ${dettagli || tronca(fonte.testo, 280)} [F${index + 1}]`;
    });
    return [
        "Dalle schede OpenGA recuperate risultano provvedimenti sul tema indicato.",
        "Le fonti OpenGA indicizzate qui contengono metadati, oggetto ed esito dei provvedimenti, non le motivazioni integrali: quindi la risposta puo riassumere le evidenze recuperate, ma non ricostruire un orientamento giurisprudenziale completo.",
        ...punti
    ].join("\n");
}
function estraiCampoSchedaOpenGa(testo, campo) {
    const campi = [
        "Sezione",
        "Numero ricorso",
        "Deposito del ricorso",
        "Tipo udienza",
        "Esito",
        "Oggetto del ricorso",
        "Tipo ricorso",
        "Componenti del collegio",
        "Dataset ufficiale"
    ];
    const marker = `${campo}:`;
    const start = testo.indexOf(marker);
    if (start === -1) {
        return undefined;
    }
    const rest = testo.slice(start + marker.length).trim();
    const nextStarts = campi
        .filter((candidate) => candidate !== campo)
        .map((candidate) => rest.indexOf(`${candidate}:`))
        .filter((index) => index > -1);
    const end = nextStarts.length > 0 ? Math.min(...nextStarts) : rest.length;
    const value = rest.slice(0, end).replace(/\s+/g, " ").replace(/\.$/, "").trim();
    return value.length > 0 ? value : undefined;
}
function creaRispostaControllataDaFonti(richiesta) {
    if (richiesta.fonti.length === 0) {
        return "Non ho fonti normative sufficienti per formulare una risposta citabile.";
    }
    const punti = richiesta.fonti.slice(0, 3).map((fonte, index) => {
        const frasi = frasiRilevanti(fonte.testo, richiesta.domanda);
        const contenuto = frasi.length > 0 ? frasi.join(" ") : tronca(fonte.testo, 280);
        return `${contenuto} [F${index + 1}]`;
    });
    return [
        "Dalle fonti recuperate risulta quanto segue.",
        ...punti,
        "La risposta resta limitata a queste fonti."
    ].join(" ");
}
function frasiRilevanti(testo, domanda) {
    const tokensDomanda = new Set(tokenizza(domanda));
    const frasi = testo
        .split(/(?<=[.!?])\s+/)
        .map((frase) => frase.trim())
        .filter((frase) => frase.length > 0);
    return frasi
        .map((frase, index) => ({
        frase,
        index,
        score: tokenizza(frase).reduce((total, token) => total + (tokensDomanda.has(token) ? 1 : 0), 0)
    }))
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score)
        .slice(0, 2)
        .sort((left, right) => left.index - right.index)
        .map((item) => item.frase);
}
function normalizzaPerConfronto(input) {
    return input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
function authorizationHeader(apiKey) {
    const value = nonEmpty(apiKey);
    return value ? { authorization: `Bearer ${value}` } : {};
}
function compactObject(input) {
    return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== null));
}
function parseApiFormat(value, fallback) {
    const normalized = value?.trim().toLowerCase();
    if (normalized === "chat" ||
        normalized === "chat-completions" ||
        normalized === "chat_completions") {
        return "chat";
    }
    if (normalized === "responses") {
        return "responses";
    }
    return fallback;
}
function numberFromEnv(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function optionalNumberFromEnv(value) {
    if (!nonEmpty(value)) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function nonEmpty(value) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}
function requireEnv(env, key) {
    const value = env[key];
    if (!value) {
        throw new Error(`Variabile d'ambiente obbligatoria mancante: ${key}`);
    }
    return value;
}
function trimTrailingSlash(value) {
    return value.replace(/\/+$/g, "");
}
