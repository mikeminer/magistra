export class CitationMetadataError extends Error {
    missingFields;
    constructor(missingFields) {
        super(`Metadati di citazione obbligatori mancanti: ${missingFields.join(", ")}`);
        this.missingFields = missingFields;
        this.name = "CitationMetadataError";
    }
}
const REQUIRED_CITATION_FIELDS = [
    "eli",
    "fonte",
    "tipoAtto",
    "numeroAtto",
    "dataAtto",
    "articolo",
    "vigenzaDa"
];
export function validateCitationMetadata(metadata) {
    const missingFields = REQUIRED_CITATION_FIELDS.filter((field) => {
        const value = metadata[field];
        return typeof value !== "string" || value.trim().length === 0;
    });
    if (!metadata.urlFonte && !metadata.idArtefattoFonte) {
        return {
            valid: false,
            missingFields: [...missingFields, "urlFonte|idArtefattoFonte"]
        };
    }
    return {
        valid: missingFields.length === 0,
        missingFields
    };
}
export function assertCitationMetadata(metadata) {
    const result = validateCitationMetadata(metadata);
    if (!result.valid) {
        throw new CitationMetadataError(result.missingFields);
    }
}
export function createChunk(input) {
    assertCitationMetadata(input.metadati);
    return {
        id: input.id,
        unitaId: input.unitaId,
        testo: input.testo,
        embedding: input.embedding,
        metadati: input.metadati
    };
}
export function createCitationLabel(metadata) {
    const comma = metadata.comma ? `, comma ${metadata.comma}` : "";
    const validity = metadata.vigenzaA
        ? `vigente dal ${metadata.vigenzaDa} al ${metadata.vigenzaA}`
        : `vigente dal ${metadata.vigenzaDa}`;
    const tipoAtto = formatActTypeForLabel(metadata);
    return `${tipoAtto} ${metadata.numeroAtto}/${metadata.dataAtto}, art. ${metadata.articolo}${comma} (${validity})`;
}
function formatActTypeForLabel(metadata) {
    if (metadata.eli.includes("/regio-decreto/")) {
        return "regio decreto";
    }
    if (metadata.eli.includes("/decreto-legislativo/")) {
        return "decreto legislativo";
    }
    if (metadata.eli.includes("/decreto-legge/")) {
        return "decreto legge";
    }
    if (metadata.eli.includes("/decreto-presidente-repubblica/")) {
        return "D.P.R.";
    }
    if (metadata.tipoAtto === "trattato-ue" || metadata.eli.includes("/treaty/")) {
        return "trattato UE";
    }
    return metadata.tipoAtto;
}
export function isVersionActiveAt(versione, date) {
    if (date < versione.vigenzaDa) {
        return false;
    }
    if (versione.vigenzaA && date > versione.vigenzaA) {
        return false;
    }
    return true;
}
