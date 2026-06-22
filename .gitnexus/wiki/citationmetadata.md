# CitationMetadata

**CitationMetadata Module Documentation**

**Overview**
------------

The CitationMetadata module is responsible for managing metadata related to citations in the application. It provides functionality for validating, formatting, and creating labels for citation metadata.

**Purpose**
----------

The primary purpose of this module is to ensure that citation metadata is accurate and consistent across the application. It achieves this by providing a set of APIs for validating, formatting, and creating labels for citation metadata.

**Key Components**
-----------------

### CitationMetadata Interface

The `CitationMetadata` interface defines the structure of citation metadata, including fields such as `eli`, `fonte`, `tipoAtto`, `numeroAtto`, `dataAtto`, `articolo`, and others.

```typescript
export interface CitationMetadata {
  eli: string;
  fonte: string;
  tipoAtto: ActType;
  numeroAtto: string;
  dataAtto: string;
  articolo: string;
  comma?: string;
  vigenzaDa: string;
  vigenzaA?: string;
  urlFonte?: string;
  idArtefattoFonte?: string;
}
```

### CitationMetadataError Class

The `CitationMetadataError` class is thrown when citation metadata validation fails. It provides a list of missing fields.

```typescript
export class CitationMetadataError extends Error {
  constructor(public readonly missingFields: readonly string[]) {
    super(`Metadati di citazione obbligatori mancanti: ${missingFields.join(", ")}`);
    this.name = "CitationMetadataError";
  }
}
```

### validateCitationMetadata Function

The `validateCitationMetadata` function validates citation metadata by checking for missing fields and ensuring that all required fields are present.

```typescript
export function validateCitationMetadata(
  metadata: Partial<CitationMetadata>
): CitationValidationResult {
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
```

### assertCitationMetadata Function

The `assertCitationMetadata` function asserts that citation metadata is valid by calling `validateCitationMetadata` and throwing a `CitationMetadataError` if validation fails.

```typescript
export function assertCitationMetadata(
  metadata: Partial<CitationMetadata>
): asserts metadata is CitationMetadata {
  const result = validateCitationMetadata(metadata);

  if (!result.valid) {
    throw new CitationMetadataError(result.missingFields);
  }
}
```

### createChunk Function

The `createChunk` function creates a chunk of data by combining citation metadata with other data.

```typescript
export function createChunk(input: {
  id: string;
  unitaId: string;
  testo: string;
  embedding?: readonly number[];
  metadati: Partial<CitationMetadata>;
}): Chunk {
  assertCitationMetadata(input.metadati);

  return {
    id: input.id,
    unitaId: input.unitaId,
    testo: input.testo,
    embedding: input.embedding,
    metadati: input.metadati
  };
}
```

### createCitationLabel Function

The `createCitationLabel` function creates a citation label by formatting citation metadata.

```typescript
export function createCitationLabel(metadata: CitationMetadata): string {
  const comma = metadata.comma ? `, comma ${metadata.comma}` : "";
  const validity = metadata.vigenzaA
    ? `vigente dal ${metadata.vigenzaDa} al ${metadata.vigenzaA}`
    : `vigente dal ${metadata.vigenzaDa}`;
  const tipoAtto = formatActTypeForLabel(metadata);

  return `${tipoAtto} ${metadata.numeroAtto}/${metadata.dataAtto}, art. ${metadata.articolo}${comma} (${validity})`;
}
```

### formatActTypeForLabel Function

The `formatActTypeForLabel` function formats the act type for a citation label.

```typescript
function formatActTypeForLabel(metadata: CitationMetadata): string {
  if (metadata.eli.includes("/regio-decreto/")) {
    return "regio decreto";
  }

  if (metadata.eli.includes("/decreto-legislativo/")) {
    return "decreto legislativo";
  }

  if (metadata.eli.includes("/decreto-legge/")) {
    return "decreto legge";
  }

  return metadata.tipoAtto;
}
```

**Connection to the Rest of the Codebase**
----------------------------------------

The CitationMetadata module connects to other parts of the codebase through various APIs and functions.

*   The `createChunk` function is called by the `parseAkomaNtosoDocument` function in the `ingest` module.
*   The `createCitationLabel` function is called by the `cercaCorpusLegaleIbrido` function in the `retrieval` module.
*   The `validateCitationMetadata` and `assertCitationMetadata` functions are used throughout the codebase to validate citation metadata.

**Mermaid Diagram**
------------------

Here is a Mermaid diagram that illustrates the connection between the CitationMetadata module and other parts of the codebase:
```mermaid
graph LR
    A[parseAkomaNtosoDocument] -->|calls createChunk|> B(createChunk)
    B -->|asserts citation metadata|> C(assertCitationMetadata)
    C -->|throws error if invalid|> D(CitationMetadataError)
    E[cercaCorpusLegaleIbrido] -->|calls createCitationLabel|> F(createCitationLabel)
    F -->|format act type for label|> G(formatActTypeForLabel)
    H[leggiFonte] -->|calls leggiFonteDaDatabase|> I(leggiFonteDaDatabase)
    I -->|calls createCitationLabel|> J(createCitationLabel)
```
This diagram shows the flow of data from the `parseAkomaNtosoDocument` function to the `createChunk` function, and then to the `assertCitationMetadata` function. It also shows the connection between the CitationMetadata module and other parts of the codebase through APIs such as `cercaCorpusLegaleIbrido` and `leggiFonte`.