import { existsSync, readFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
export class FonteConRiusoNonVerificatoError extends Error {
    fonte;
    constructor(fonte) {
        super(`Riuso fonte non verificato: ${fonte.nome}`);
        this.fonte = fonte;
        this.name = "FonteConRiusoNonVerificatoError";
    }
}
const NORMATTIVA_BASE_URL = "https://www.normattiva.it";
const NORMATTIVA_OPENDATA_API_URL = "https://api.normattiva.it/t/normattiva.api/bff-opendata/v1";
const EUR_LEX_BASE_URL = "https://eur-lex.europa.eu";
const EUR_LEX_LEGAL_NOTICE_URL = "https://eur-lex.europa.eu/content/legal-notice/legal-notice.html";
const EUR_LEX_REUSE_DECISION_URL = "https://eur-lex.europa.eu/eli/dec/2011/833/oj";
const GAZZETTA_BASE_URL = "https://www.gazzettaufficiale.it";
const OPENGA_BASE_URL = "https://openga.giustizia-amministrativa.it";
const CC_BY_4_URL = "https://creativecommons.org/licenses/by/4.0/deed.it";
const CASSAZIONE_BASE_URL = "https://www.cortedicassazione.it";
export class NormattivaAdapter {
    fonte = {
        ambitoRiuso: "Legislazione statale italiana acquisita tramite Open Data o URL Normattiva espliciti, con conservazione di URN, ELI e URL sorgente.",
        descrizione: "Legislazione statale italiana con identificatori ELI.",
        evidenzeRiuso: ["https://dati.normattiva.it/"],
        frequenzaSuggerita: "settimanale",
        id: "normattiva",
        licenza: "Normattiva Open Data con attribuzione e conservazione URL/URN sorgente",
        nome: "Normattiva",
        riuso: "aperto",
        tipo: "normattiva",
        url: `${NORMATTIVA_BASE_URL}/`
    };
    pianificaRichieste(seed = "urn:nir:stato:legge:1990-08-07;241") {
        return [
            {
                fonteId: this.fonte.id,
                metodo: "GET",
                motivo: "Acquisizione atto AKN/HTML da identificatore NIR/ELI",
                url: creaUrlNormattivaDaUrn(seed)
            }
        ];
    }
    validaRiuso() {
        return { ok: true };
    }
}
export class EurLexAdapter {
    fonte = {
        ambitoRiuso: "Documenti giuridici EUR-Lex riusabili per finalita commerciali e non commerciali, con attribuzione della fonte e indicazione delle modifiche quando applicabile.",
        descrizione: "Diritto UE e collegamenti a recepimento nazionale.",
        evidenzeRiuso: [EUR_LEX_LEGAL_NOTICE_URL, EUR_LEX_REUSE_DECISION_URL],
        frequenzaSuggerita: "settimanale",
        id: "eur-lex",
        licenza: "Riuso autorizzato dalla policy EUR-Lex, basata sulla Decisione 2011/833/UE, salvo eccezioni indicate sul singolo documento.",
        nome: "EUR-Lex",
        riuso: "aperto",
        tipo: "eur-lex",
        url: `${EUR_LEX_BASE_URL}/`
    };
    pianificaRichieste(seed = "eli/reg/2016/679/oj") {
        return [
            {
                fonteId: this.fonte.id,
                metodo: "GET",
                motivo: "Risoluzione identificatore ELI europeo e metadati collegati",
                url: `${EUR_LEX_BASE_URL}/${seed}`
            }
        ];
    }
    validaRiuso() {
        return { ok: true };
    }
}
export class GazzettaUfficialeAdapter {
    fonte = {
        ambitoRiuso: "Verifica della pubblicazione e riuso dei testi elettronici con menzione della fonte, del carattere non autentico e gratuito. Non autorizza replica massiva o sostitutiva del servizio editoriale.",
        descrizione: "Verifica pubblicazione ufficiale e atti recenti.",
        evidenzeRiuso: [
            `${GAZZETTA_BASE_URL}/`,
            `${GAZZETTA_BASE_URL}/atto/serie_generale/caricaArticolo?art.codiceRedazionale=13G00076&art.dataPubblicazioneGazzetta=2013-04-05&art.flagTipoArticolo=0&art.idArticolo=7&art.idGruppo=1&art.idSottoArticolo=1&art.idSottoArticolo1=10&art.progressivo=0&art.versione=1`
        ],
        frequenzaSuggerita: "giornaliera",
        id: "gazzetta-ufficiale",
        licenza: "Riproduzione dei testi elettronici consentita con menzione della fonte, del carattere non autentico e gratuito; riuso dei dati pubblicati nei limiti del d.lgs. 33/2013, art. 7.",
        nome: "Gazzetta Ufficiale",
        riuso: "aperto",
        tipo: "gazzetta-ufficiale",
        url: `${GAZZETTA_BASE_URL}/`
    };
    pianificaRichieste(seed = "eli/id/2026/01/01") {
        return [
            {
                fonteId: this.fonte.id,
                metodo: "GET",
                motivo: "Verifica pubblicazione o metadati di entrata in vigore",
                url: `${GAZZETTA_BASE_URL}/${seed}`
            }
        ];
    }
    validaRiuso() {
        return { ok: true };
    }
}
export class GiurisprudenzaApertaAdapter {
    fonte = {
        ambitoRiuso: "Dataset e documenti pubblicati da OpenGA salvo diversa indicazione del singolo dataset, con attribuzione e link alla pagina originale quando possibile.",
        descrizione: "Open data della Giustizia Amministrativa, separati dal corpus normativo.",
        evidenzeRiuso: [`${OPENGA_BASE_URL}/about`, CC_BY_4_URL],
        frequenzaSuggerita: "manuale",
        id: "giurisprudenza-aperta",
        licenza: "CC-BY 4.0 salvo diversa indicazione sul singolo dataset OpenGA",
        nome: "OpenGA - Giustizia Amministrativa",
        riuso: "aperto",
        tipo: "giurisprudenza",
        url: `${OPENGA_BASE_URL}/`
    };
    pianificaRichieste() {
        return [
            {
                fonteId: this.fonte.id,
                metodo: "GET",
                motivo: "Catalogazione dataset giurisprudenziali aperti con licenza esplicita",
                url: `${OPENGA_BASE_URL}/dataset/`
            }
        ];
    }
    validaRiuso() {
        return { ok: true };
    }
}
export class CassazionePenaleAdapter {
    fonte = {
        ambitoRiuso: "Schede pubbliche della Corte Suprema di Cassazione per giurisprudenza penale: metadati, oggetto, esito in sintesi e link al documento ufficiale. L'ingest conserva il link alla fonte e non sostituisce Italgiure o il Massimario.",
        descrizione: "Giurisprudenza penale di legittimita pubblicata dalla Corte di Cassazione.",
        evidenzeRiuso: [
            `${CASSAZIONE_BASE_URL}/it/giurisprudenza_penale.page`,
            `${CASSAZIONE_BASE_URL}/it/note_legali.page`
        ],
        frequenzaSuggerita: "giornaliera",
        id: "cassazione-penale",
        licenza: "Schede pubbliche del sito istituzionale della Corte Suprema di Cassazione; riuso da verificare sul singolo documento e conservando URL ufficiale.",
        nome: "Cassazione penale",
        riuso: "da-verificare",
        tipo: "giurisprudenza",
        url: `${CASSAZIONE_BASE_URL}/it/giurisprudenza_penale.page`
    };
    pianificaRichieste(seed = "giurisprudenza_penale.page") {
        const url = seed.startsWith("http")
            ? seed
            : `${CASSAZIONE_BASE_URL}/it/${seed.replace(/^\/+/, "")}`;
        return [
            {
                fonteId: this.fonte.id,
                metodo: "GET",
                motivo: "Acquisizione schede pubbliche di giurisprudenza penale dal sito ufficiale della Corte di Cassazione",
                url
            }
        ];
    }
    validaRiuso() {
        return {
            ok: true,
            motivo: "Import limitato a schede pubbliche, metadati, sintesi e URL ufficiali; il testo integrale resta tracciato tramite link al documento originario."
        };
    }
}
export function creaRegistroFonti() {
    return [
        new NormattivaAdapter(),
        new EurLexAdapter(),
        new GazzettaUfficialeAdapter(),
        new GiurisprudenzaApertaAdapter(),
        new CassazionePenaleAdapter()
    ];
}
export function fontiCatalogabili() {
    return creaRegistroFonti().map((adapter) => ({
        id: adapter.fonte.id,
        fonte: adapter.fonte.nome,
        tipo: adapter.fonte.tipo,
        url: adapter.fonte.url,
        licenza: adapter.fonte.licenza,
        riuso: adapter.fonte.riuso,
        stato: adapter.validaRiuso().ok ? "abilitata" : "richiede-review",
        dettagli: {
            ambitoRiuso: adapter.fonte.ambitoRiuso,
            descrizione: adapter.fonte.descrizione,
            evidenzeRiuso: adapter.fonte.evidenzeRiuso,
            frequenzaSuggerita: adapter.fonte.frequenzaSuggerita,
            motivoRiuso: adapter.validaRiuso().motivo
        }
    }));
}
export function assertRiusoConsentito(adapter) {
    const validation = adapter.validaRiuso();
    if (!validation.ok) {
        throw new FonteConRiusoNonVerificatoError(adapter.fonte);
    }
}
export async function scaricaDocumentoAkomaNtoso(adapter, url, fetchImpl = fetchConFallbackCaLocale) {
    assertRiusoConsentito(adapter);
    const response = await fetchImpl(url, {
        headers: {
            accept: "application/akn+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
            "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
        },
        method: "GET"
    });
    if (!response.ok) {
        throw new Error(`Download fonte fallito (${response.status} ${response.statusText}): ${url}`);
    }
    const xml = await response.text();
    if (!xml.includes("<akomaNtoso")) {
        throw new Error(`La fonte scaricata non sembra un documento Akoma Ntoso: ${url}`);
    }
    return {
        contentType: response.headers?.get("content-type") ?? undefined,
        fonte: adapter.fonte,
        sourceUrl: url,
        xml
    };
}
export async function scaricaAttoNormattivaOpenData(adapter, urn, fetchImpl = fetchConFallbackCaLocale) {
    assertRiusoConsentito(adapter);
    const response = await fetchImpl(`${NORMATTIVA_OPENDATA_API_URL}/api/v1/atto/dettaglio-atto-urn`, {
        body: JSON.stringify({ urn }),
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
        },
        method: "POST"
    });
    if (!response.ok) {
        if (urn.includes("~art")) {
            return await scaricaAttoNormattivaDaPaginaClassica(adapter, urn, fetchImpl, response);
        }
        throw new Error(`Download dettaglio Normattiva fallito (${response.status} ${response.statusText}): ${urn}`);
    }
    try {
    try {
        const payload = parseNormattivaOpenDataPayload(await response.text(), urn);
        const xml = convertiDettaglioNormattivaInAkomaNtoso(payload.atto, urn);
        return {
            contentType: "application/akn+xml",
            fonte: adapter.fonte,
            sourceUrl: creaUrlNormattivaDaUrn(urn),
            xml
        };
    }
    catch (error) {
        if (urn.includes("~art")) {
            return await scaricaAttoNormattivaDaPaginaClassica(adapter, urn, fetchImpl, response);
        }
        throw error;
    }
}
    catch (error) {
        if (urn.includes("~art")) {
            return await scaricaAttoNormattivaDaPaginaClassica(adapter, urn, fetchImpl, response);
        }
        throw error;
    }
}
export async function scaricaSchedeCassazionePenale(adapter, options = {}, fetchImpl = fetchConFallbackCaLocale) {
    assertRiusoConsentito(adapter);
    const maxSchede = Math.max(1, Math.min(Number(options.maxSchede ?? 8), 30));
    const paginaUrl = options.url ?? `${CASSAZIONE_BASE_URL}/it/giurisprudenza_penale.page`;
    const response = await fetchImpl(paginaUrl, {
        headers: {
            accept: "text/html,application/xhtml+xml",
            "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
        },
        method: "GET"
    });
    if (!response.ok) {
        throw new Error(`Download Cassazione penale fallito (${response.status} ${response.statusText}): ${paginaUrl}`);
    }
    const html = await response.text();
    const links = estraiLinkDettaglioCassazionePenale(html, paginaUrl).slice(0, maxSchede);
    const schede = [];
    for (const link of links) {
        try {
            const scheda = await scaricaSchedaCassazionePenaleDettaglio(adapter, link.url, fetchImpl);
            if (scheda.testo.trim().length > 0) {
                schede.push(scheda);
            }
        }
        catch {
            schede.push(link);
        }
    }
    return schede;
}
async function scaricaSchedaCassazionePenaleDettaglio(adapter, url, fetchImpl) {
    const response = await fetchImpl(url, {
        headers: {
            accept: "text/html,application/xhtml+xml",
            "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
        },
        method: "GET"
    });
    if (!response.ok) {
        throw new Error(`Download dettaglio Cassazione penale fallito (${response.status} ${response.statusText}): ${url}`);
    }
    const html = await response.text();
    const numeroData = estraiNumeroDataCassazionePenale(html);
    const sezione = estraiTestoPrimaOccorrenza(html, /\b((?:Prima|Seconda|Terza|Quarta|Quinta|Sesta|Settima|Sezioni Unite)\s+sezione)\b/i);
    const materia = estraiTestoPrimaOccorrenza(html, /Sentenza\s*\|\s*Materia:\s*(?:<strong>)?([\s\S]*?)(?:<\/strong>)?<\/p>/i) ??
        estraiTestoPrimaOccorrenza(html, /Materia:\s*([\s\S]*?)<\/p>/i);
    const oggetto = estraiSezioneHtmlCassazione(html, /<h[2-4][^>]*>\s*Oggetto\s*<\/h[2-4]>/i);
    const sintesi = estraiSezioneHtmlCassazione(html, /<h[2-4][^>]*>\s*L[’'`]?esito in sintesi\s*<\/h[2-4]>/i);
    const dataUdienza = estraiTestoPrimaOccorrenza(html, /Data udienza:\s*([\s\S]*?)<\/p>/i);
    const pdfUrl = estraiLinkPdfCassazionePenale(html, url);
    const testo = normalizzaSpazi([
        numeroData.titolo,
        sezione ? `Sezione: ${sezione}` : "",
        materia ? `Materia: ${materia}` : "",
        dataUdienza ? `Data udienza: ${dataUdienza}` : "",
        oggetto ? `Oggetto: ${oggetto}` : "",
        sintesi ? `Esito in sintesi: ${sintesi}` : "",
        pdfUrl ? `Documento ufficiale: ${pdfUrl}` : ""
    ].filter(Boolean).join(" "));
    return {
        contentId: new URL(url).searchParams.get("contentId") ?? hashTestoCassazione(url),
        dataDeposito: numeroData.dataDeposito,
        dataUdienza,
        fonte: adapter.fonte,
        materia,
        numero: numeroData.numero,
        oggetto,
        pdfUrl,
        sezione,
        sintesi,
        testo,
        titolo: numeroData.titolo,
        url
    };
}
function estraiLinkDettaglioCassazionePenale(html, paginaUrl) {
    const links = [];
    const seen = new Set();
    const regex = /<a[^>]+href=["']([^"']*penale_dettaglio\.page\?contentId=[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(regex)) {
        const href = match[1];
        const text = cleanHtmlText(match[2] ?? "");
        const url = new URL(href.replace(/&amp;/g, "&"), paginaUrl).toString();
        const contentId = new URL(url).searchParams.get("contentId") ?? hashTestoCassazione(url);
        if (seen.has(contentId)) {
            continue;
        }
        seen.add(contentId);
        links.push({
            contentId,
            dataDeposito: estraiDataDepositoDaTitoloCassazione(text),
            fonte: {
                ambitoRiuso: "Scheda pubblica di giurisprudenza penale della Corte di Cassazione.",
                descrizione: "Scheda pubblica Cassazione penale.",
                evidenzeRiuso: [url],
                frequenzaSuggerita: "manuale",
                id: "cassazione-penale",
                licenza: "Scheda pubblica del sito Corte di Cassazione; riuso da verificare sul singolo documento.",
                nome: "Cassazione penale",
                riuso: "da-verificare",
                tipo: "giurisprudenza",
                url
            },
            numero: estraiNumeroSentenzaDaTitoloCassazione(text),
            testo: text,
            titolo: text || "Scheda Cassazione penale",
            url
        });
    }
    return links;
}
function estraiNumeroDataCassazionePenale(html) {
    const titolo = estraiTestoPrimaOccorrenza(html, /<h2[^>]*>\s*(Sentenza Numero:[\s\S]*?)<\/h2>/i) ??
        estraiTestoPrimaOccorrenza(html, /(Sentenza Numero:[\s\S]{0,160})/i) ??
        "Scheda Cassazione penale";
    return {
        dataDeposito: estraiDataDepositoDaTitoloCassazione(titolo) ?? new Date().toISOString().slice(0, 10),
        numero: estraiNumeroSentenzaDaTitoloCassazione(titolo) ?? hashTestoCassazione(titolo),
        titolo
    };
}
function estraiSezioneHtmlCassazione(html, marker) {
    const match = marker.exec(html);
    if (!match || match.index === undefined) {
        return undefined;
    }
    const start = match.index + match[0].length;
    const nextHeading = html.slice(start).search(/<h[2-4][^>]*>|<section|<footer/i);
    const raw = html.slice(start, nextHeading >= 0 ? start + nextHeading : start + 2500);
    const text = cleanHtmlText(raw);
    return text.length > 0 ? text : undefined;
}
function estraiTestoPrimaOccorrenza(html, regex) {
    const value = cleanHtmlText(regex.exec(html)?.[1] ?? "");
    return value.length > 0 ? value : undefined;
}
function estraiLinkPdfCassazionePenale(html, pageUrl) {
    const match = html.match(/<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>/i);
    return match?.[1] ? new URL(match[1].replace(/&amp;/g, "&"), pageUrl).toString() : undefined;
}
function estraiNumeroSentenzaDaTitoloCassazione(titolo) {
    return titolo.match(/(?:Sentenza\s+)?(?:Numero|n\.)\s*:?\s*([0-9]+)/i)?.[1];
}
function estraiDataDepositoDaTitoloCassazione(titolo) {
    const iso = titolo.match(/\b(20[0-9]{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12][0-9]|3[01])\b/);
    if (iso) {
        return `${iso[1]}-${String(iso[2]).padStart(2, "0")}-${String(iso[3]).padStart(2, "0")}`;
    }
    const textual = titolo.match(/deposito\s+(?:del\s+)?([0-9]{1,2})\s+([a-zà]+)\s+(20[0-9]{2})/i);
    if (!textual) {
        return undefined;
    }
    const month = mesiItaliani[textual[2]?.toLowerCase() ?? ""];
    return month ? `${textual[3]}-${month}-${String(textual[1]).padStart(2, "0")}` : undefined;
}
const mesiItaliani = {
    aprile: "04",
    agosto: "08",
    dicembre: "12",
    febbraio: "02",
    gennaio: "01",
    giugno: "06",
    luglio: "07",
    maggio: "05",
    marzo: "03",
    novembre: "11",
    ottobre: "10",
    settembre: "09"
};
function hashTestoCassazione(value) {
    let hash = 5381;
    for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) + hash + value.charCodeAt(index)) | 0;
    }
    return Math.abs(hash).toString(36);
}
export function creaUrlNormattivaDaUrn(urn) {
    return `${NORMATTIVA_BASE_URL}/uri-res/N2Ls?${urn}`;
}
async function scaricaAttoNormattivaDaPaginaClassica(adapter, urn, fetchImpl, previousResponse) {
    const articolo = estraiArticoloDaUrn(urn);
    if (!articolo) {
        throw new Error(`Download dettaglio Normattiva fallito (${previousResponse.status} ${previousResponse.statusText}): ${urn}`);
    }
    const sourceUrl = creaUrlNormattivaDaUrn(urn);
    const pageResponse = await fetchImpl(sourceUrl, {
        headers: {
            accept: "text/html,application/xhtml+xml",
            "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
        },
        method: "GET"
    });
    if (!pageResponse.ok) {
        throw new Error(`Fallback HTML Normattiva fallito (${pageResponse.status} ${pageResponse.statusText}): ${urn}`);
    }
    const cookie = creaCookieHeader(pageResponse.headers);
    const pageHtml = await pageResponse.text();
    const articoloUrl = trovaUrlArticoloNormattiva(pageHtml, articolo);
    if (!articoloUrl) {
        throw new Error(`Fallback HTML Normattiva non ha trovato l'articolo ${articolo}: ${urn}`);
    }
    const detailUrl = new URL(articoloUrl.replace(/&amp;/g, "&"), NORMATTIVA_BASE_URL).toString();
    const detailResponse = await fetchImpl(detailUrl, {
        headers: {
            accept: "text/html,*/*",
            cookie,
            referer: sourceUrl,
            "user-agent": "MagistraOS/0.1 (+https://github.com/mikeminer/Italian-OSS-Legal-Platform)"
        },
        method: "GET"
    });
    if (!detailResponse.ok) {
        throw new Error(`Fallback HTML articolo Normattiva fallito (${detailResponse.status} ${detailResponse.statusText}): ${urn}`);
    }
    const articoloHtml = await detailResponse.text();
    const xml = convertiDettaglioNormattivaInAkomaNtoso({
        articoloDataInizioVigenza: estraiVersionDateNormattiva(pageHtml),
        articoloHtml,
        sottoTitolo: estraiMetaDescriptionNormattiva(pageHtml),
        titolo: estraiTitleNormattiva(pageHtml)
    }, urn);
    return {
        contentType: "application/akn+xml",
        fonte: adapter.fonte,
        sourceUrl,
        xml
    };
}
function estraiArticoloDaUrn(urn) {
    return normalizzaIdentificatoreArticolo(urn.match(/~art([0-9]+(?:[-_][a-z]+)?)/i)?.[1]);
}
function trovaUrlArticoloNormattiva(html, articolo) {
    const target = normalizzaIdentificatoreArticolo(articolo);
    const regex = /showArticle\('([^']+)'[^)]*\)[^>]*class="numero_articolo"[^>]*>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(regex)) {
        const label = normalizzaIdentificatoreArticolo(cleanHtmlText(match[2] ?? "").replace(/^art\.?\s*/i, ""));
        if (label === target) {
            return match[1];
        }
    }
    return undefined;
}
function normalizzaIdentificatoreArticolo(value) {
    return value?.replace(/_/g, "-").replace(/\s*-\s*/g, "-").trim().replace(/\s+/g, "-").toLowerCase();
}
function creaCookieHeader(headers) {
    const headerRecord = headers;
    const values = typeof headerRecord.getSetCookie === "function"
        ? headerRecord.getSetCookie()
        : splitSetCookieHeader(headers.get("set-cookie"));
    return values.map((cookie) => cookie.split(";", 1)[0]).filter(Boolean).join("; ");
}
function splitSetCookieHeader(value) {
    if (!value) {
        return [];
    }
    return value.split(/,(?=\s*[^;,]+=)/g).map((cookie) => cookie.trim()).filter(Boolean);
}
function estraiTitleNormattiva(html) {
    return cleanHtmlText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "Normattiva");
}
function estraiMetaDescriptionNormattiva(html) {
    return cleanHtmlText(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] ?? "");
}
function estraiVersionDateNormattiva(html) {
    const value = html.match(/property=["']eli:version_date["'][^>]*content=["'](\d{4})-(\d{2})-(\d{2})["']/i);
    return value ? `${value[1]}${value[2]}${value[3]}` : undefined;
}
async function fetchConFallbackCaLocale(url, init) {
    try {
        return await fetch(url, init);
    }
    catch (error) {
        if (!isErroreCertificatoTls(error)) {
            throw error;
        }
        const ca = leggiCertificatiCaLocali();
        if (!ca) {
            throw error;
        }
        return await fetchHttpsConCaLocale(url, init, ca);
    }
}
function fetchHttpsConCaLocale(url, init = {}, ca) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const request = httpsRequest(url, {
            ca,
            headers: init.headers,
            method: init.method ?? "GET"
        }, (response) => {
            response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
            response.on("end", () => {
                const body = Buffer.concat(chunks).toString("utf8");
                resolve({
                    headers: {
                        get(name) {
                            const value = response.headers[name.toLowerCase()];
                            return Array.isArray(value) ? value.join(", ") : value ?? null;
                        }
                    },
                    ok: response.statusCode !== undefined &&
                        response.statusCode >= 200 &&
                        response.statusCode < 300,
                    status: response.statusCode ?? 0,
                    statusText: response.statusMessage ?? "",
                    async text() {
                        return body;
                    }
                });
            });
        });
        request.on("error", reject);
        if (init.body) {
            request.write(init.body);
        }
        request.end();
    });
}
function leggiCertificatiCaLocali() {
    const candidates = [
        process.env.NODE_EXTRA_CA_CERTS,
        process.env.MAGISTRA_EXTRA_CA_CERTS,
        "artifacts/certs/avast-root.pem",
        "artifacts/certs/local-webmail-shield-root.pem",
        "certs/local-ca.pem",
        "../../artifacts/certs/avast-root.pem",
        "../../artifacts/certs/local-webmail-shield-root.pem",
        "../../certs/local-ca.pem",
        new URL("../../../artifacts/certs/avast-root.pem", import.meta.url),
        new URL("../../../artifacts/certs/local-webmail-shield-root.pem", import.meta.url),
        new URL("../../../certs/local-ca.pem", import.meta.url),
        "/app/certs/local-ca.pem"
    ];
    const certs = [];
    const seen = new Set();
    for (const candidate of candidates) {
        const key = candidate instanceof URL ? candidate.href : candidate;
        if (!candidate || seen.has(key) || !existsSync(candidate)) {
            continue;
        }
        seen.add(key);
        certs.push(readFileSync(candidate, "utf8"));
    }
    return certs.length > 0 ? certs.join("\n") : undefined;
}
function isErroreCertificatoTls(error) {
    const record = error;
    const codes = new Set([
        "DEPTH_ZERO_SELF_SIGNED_CERT",
        "SELF_SIGNED_CERT_IN_CHAIN",
        "UNABLE_TO_GET_ISSUER_CERT",
        "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
    ]);
    return codes.has(String(record?.code)) || codes.has(String(record?.cause?.code));
}
function parseNormattivaOpenDataPayload(raw, urn) {
    const parsed = JSON.parse(raw);
    const atto = parsed.data?.atto ?? parsed.data?.lista?.[0];
    if (!parsed.success || !atto?.articoloHtml) {
        throw new Error(`Risposta Open Data Normattiva priva di dettaglio atto: ${urn}`);
    }
    return { atto };
}
function convertiDettaglioNormattivaInAkomaNtoso(atto, urn) {
    const urnParts = parseUrnNormattiva(urn, atto);
    const titolo = normalizzaSpazi(`${atto.titolo ?? urnParts.tipoAtto} ${atto.sottoTitolo ?? ""}`);
    const vigenzaDa = formattaDataNormattiva(atto.articoloDataInizioVigenza) ?? urnParts.data;
    const articoli = estraiArticoliDaHtmlNormattiva(atto.articoloHtml ?? "");
    if (articoli.length === 0) {
        throw new Error(`Nessun articolo riconosciuto nel dettaglio Normattiva: ${urn}`);
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="${xmlEscape(urnParts.tipoAtto)}">
    <meta>
      <identification source="#normattiva">
        <FRBRWork>
          <FRBRthis value="${xmlEscape(urnParts.eli)}" />
          <FRBRdate date="${xmlEscape(urnParts.data)}" name="generation" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRnumber value="${xmlEscape(urnParts.numero)}" />
          <FRBRname value="${xmlEscape(urnParts.tipoAtto)}" />
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="${xmlEscape(`${urnParts.eli}/ita@${vigenzaDa}`)}" />
          <FRBRdate date="${xmlEscape(vigenzaDa)}" name="version" />
          <FRBRauthor href="/it/stato" as="#autorita" />
          <FRBRlanguage language="ita" />
        </FRBRExpression>
      </identification>
    </meta>
    <preface>
      <p>
        <docTitle>${xmlEscape(titolo)}</docTitle>
      </p>
    </preface>
    <body>
${articoli
        .map((articolo) => `      <article eId="art_${xmlEscape(toXmlId(articolo.numero))}">
        <num>Art. ${xmlEscape(articolo.numero)}</num>
        ${articolo.rubrica ? `<heading>${xmlEscape(articolo.rubrica)}</heading>` : ""}
${articolo.commi
        .map((comma) => `        <paragraph eId="art_${xmlEscape(toXmlId(articolo.numero))}__para_${xmlEscape(toXmlId(comma.numero))}">
          <num>${xmlEscape(comma.numero)}.</num>
          <content>
            <p>${xmlEscape(comma.testo)}</p>
          </content>
        </paragraph>`)
        .join("\n")}
      </article>`)
        .join("\n")}
    </body>
  </act>
</akomaNtoso>`;
}
function parseUrnNormattiva(urn, atto) {
    const match = urn.match(/^urn:nir:stato:(.+):(\d{4})(?:-(\d{2})-(\d{2}))?;([^!~]+)(?:[!~].*)?$/);
    const tipoAtto = normalizzaTipoAtto(match?.[1] ?? atto.tipoProvvedimentoDescrizione);
    const data = match
        ? [
            match[2],
            match[3] ?? pad2(atto.meseProvvedimento),
            match[4] ?? pad2(atto.giornoProvvedimento)
        ].join("-")
        : [
            atto.annoProvvedimento,
            pad2(atto.meseProvvedimento),
            pad2(atto.giornoProvvedimento)
        ].join("-");
    const numero = match?.[5] ?? String(atto.numeroProvvedimento ?? "s.n.");
    const [anno, mese, giorno] = data.split("-");
    return {
        data,
        eli: `/eli/it/stato/${tipoAtto}/${anno}/${mese}/${giorno}/${numero}`,
        numero,
        tipoAtto
    };
}
function estraiArticoliDaHtmlNormattiva(html) {
    const articleHeadingRegex = /<h2[^>]*class=["'][^"']*article-num-akn[^"']*["'][^>]*>([\s\S]*?)<\/h2>/gi;
    const matches = [...html.matchAll(articleHeadingRegex)];
    if (matches.length === 0) {
        const articoloAttachment = estraiArticoloAttachmentDaHtmlNormattiva(html);
        return articoloAttachment ? [articoloAttachment] : [];
    }
    return matches
        .map((match, index) => {
        const start = (match.index ?? 0) + match[0].length;
        const end = matches[index + 1]?.index ?? html.length;
        const segment = html.slice(start, end);
        const numero = cleanHtmlText(match[1] ?? "").replace(/^art\.?\s*/i, "");
        const rubrica = cleanHtmlText(segment.match(/<div[^>]*class=["'][^"']*article-heading-akn[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? "");
        let commi = [...segment.matchAll(/<span[^>]*class=["'][^"']*comma-num-akn[^"']*["'][^>]*>([\s\S]*?)<\/span>\s*<span[^>]*class=["'][^"']*art_text_in_comma[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)].map((commaMatch) => ({
            numero: cleanHtmlText(commaMatch[1] ?? "").replace(/\.$/, ""),
            testo: cleanHtmlText(commaMatch[2] ?? "")
        }));
        if (commi.length === 0) {
            const commaMarkers = [...segment.matchAll(/<span[^>]*class=["'][^"']*comma-num-akn[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)];
            commi = commaMarkers.map((commaMatch, commaIndex) => {
                const start = (commaMatch.index ?? 0) + commaMatch[0].length;
                const end = commaMarkers[commaIndex + 1]?.index ?? segment.length;
                return {
                    numero: cleanHtmlText(commaMatch[1] ?? "").replace(/\.$/, ""),
                    testo: cleanHtmlText(segment.slice(start, end))
                };
            });
        }
        const bloccoTesto = cleanHtmlText(segment.match(/<span[^>]*class=["'][^"']*art-just-text-akn[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "");
        if (commi.length === 0 && bloccoTesto) {
            commi = [
                {
                    numero: "1",
                    testo: bloccoTesto
                }
            ];
        }
        return {
            commi: commi.filter((comma) => comma.numero && comma.testo),
            numero,
            rubrica: rubrica || undefined
        };
    })
        .filter((articolo) => articolo.numero && articolo.commi.length > 0);
}
function estraiArticoloAttachmentDaHtmlNormattiva(html) {
    const block = html.match(/<span[^>]*class=["'][^"']*attachment-just-text[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1];
    if (!block) {
        return undefined;
    }
    const righe = decodeHtmlEntities(block
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<[^>]+>/g, " "))
        .replace(/\(\(/g, "")
        .replace(/\)\)/g, "")
        .split(/\n+/)
        .map((riga) => normalizzaSpazi(riga))
        .filter(Boolean);
    const articoloRiga = righe.find((riga) => /^art\.?\s+/i.test(riga));
    const numero = articoloRiga?.match(/^art\.?\s*([0-9]+(?:\s*[- ]?\s*[a-z]+)?)/i)?.[1]?.replace(/\s*-\s*/g, "-");
    const rubrica = righe.find((riga) => /^\(.+\)\.?$/.test(riga))?.replace(/^\(|\)\.?$/g, "");
    const commi = righe
        .filter((riga) => riga !== articoloRiga && riga !== `(${rubrica}).` && riga !== `(${rubrica})`)
        .map((testo, index) => ({
        numero: String(index + 1),
        testo
    }));
    return numero && commi.length > 0
        ? {
            commi,
            numero,
            rubrica
        }
        : undefined;
}
function cleanHtmlText(value) {
    return normalizzaSpazi(decodeHtmlEntities(value
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\(\(/g, "")
        .replace(/\)\)/g, "")));
}
function decodeHtmlEntities(value) {
    return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
        const lower = code.toLowerCase();
        const named = {
            agrave: "a",
            amp: "&",
            apos: "'",
            egrave: "e",
            eacute: "e",
            igrave: "i",
            lt: "<",
            ldquo: '"',
            nbsp: " ",
            ndash: "-",
            ograve: "o",
            quot: '"',
            rdquo: '"',
            rsquo: "'",
            ugrave: "u"
        };
        if (lower in named) {
            return named[lower] ?? entity;
        }
        if (lower.startsWith("#x")) {
            return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
        }
        if (lower.startsWith("#")) {
            return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
        }
        return entity;
    });
}
function normalizzaTipoAtto(value) {
    const normalized = (value ?? "altro")
        .toLowerCase()
        .replaceAll(".", "-")
        .replace(/\s+/g, "-");
    if (normalized === "decreto-legislativo") {
        return "decreto-legislativo";
    }
    if (normalized === "decreto-legge") {
        return "decreto-legge";
    }
    if (normalized === "legge") {
        return "legge";
    }
    if (normalized.includes("codice")) {
        return "codice";
    }
    if (normalized.includes("regolamento")) {
        return "regolamento";
    }
    return normalized || "altro";
}
function formattaDataNormattiva(value) {
    if (!value || value === "99999999") {
        return undefined;
    }
    const match = value.match(/^(\d{4})(\d{2})(\d{2})$/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined;
}
function normalizzaSpazi(value) {
    return value.replace(/\s+/g, " ").trim();
}
function pad2(value) {
    return String(value ?? 1).padStart(2, "0");
}
function toXmlId(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function xmlEscape(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
