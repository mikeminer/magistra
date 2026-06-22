# Other — sources

**Sources Module Documentation**

**Overview**
------------

The Sources module is responsible for managing and interacting with external data sources, such as Normattiva, EurLex, Gazzetta Ufficiale, and Giurisprudenza Aperta. It provides a unified interface for accessing and processing this data, ensuring consistency and accuracy across the application.

**Purpose**
------------

The primary purpose of the Sources module is to:

* Provide a centralized repository for external data sources
* Offer a standardized API for interacting with these sources
* Ensure data consistency and accuracy through validation and verification mechanisms
* Facilitate data processing and transformation for use in the application

**Key Components**
------------------

### 1. Data Adapters

Data adapters are classes that wrap around external data sources, providing a standardized interface for accessing and manipulating their data. The Sources module includes several built-in data adapters:

* `NormattivaAdapter`
* `EurLexAdapter`
* `GazzettaUfficialeAdapter`
* `GiurisprudenzaApertaAdapter`

Each adapter is responsible for handling specific data formats, validation rules, and verification mechanisms.

### 2. Data Validation

Data validation is a critical component of the Sources module. It ensures that incoming data conforms to expected formats and rules, preventing errors and inconsistencies in the application. The module includes several validation functions:

* `validaRiuso`: Verifies whether a source has been approved for reuse
* `assertRiusoConsentito`: Asserts that a source has been approved for reuse

### 3. Data Processing

Data processing involves transforming and manipulating data from external sources to meet the application's requirements. The Sources module includes several functions for this purpose:

* `fontiCatalogabili`: Returns a list of catalogable fonts
* `creaRegistroFonti`: Creates a registry of font sources
* `pianificaRichieste`: Plans requests for specific data sources

### 4. Data Retrieval

Data retrieval involves fetching data from external sources and returning it to the application. The Sources module includes several functions for this purpose:

* `scaricaAttoNormattivaOpenData`: Retrieves an Act of Normattiva Open Data
* `scaricaDocumentoAkomaNtoso`: Retrieves a Document Akoma Ntoso

**Call Graph & Execution Flows**
---------------------------------

The following Mermaid diagram illustrates the call graph and execution flows for the Sources module:

```mermaid
graph LR
    A[Sources.test.ts] -->|creaRegistroFonti|> B[src/index.ts]
    A[Sources.test.ts] -->|GazzettaUfficialeAdapter|> C[src/index.ts]
    A[Sources.test.ts] -->|scaricaAttoNormattivaOpenData|> D[src/index.ts]
    A[Sources.test.ts] -->|validaRiuso|> E[src/index.ts]
    A[Sources.test.ts] -->|pianificaRichieste|> F[src/index.ts]
    A[Sources.test.ts] -->|scaricaDocumentoAkomaNtoso|> G[src/index.ts]
    A[Sources.test.ts] -->|NormattivaAdapter|> H[src/index.ts]
    A[Sources.test.ts] -->|GiurisprudenzaApertaAdapter|> I[src/index.ts]
    A[Sources.test.ts] -->|fontiCatalogabili|> J[src/index.ts]
    A[Sources.test.ts] -->|assertRiusoConsentito|> K[src/index.ts]
    A[Sources.test.ts] -->|EurLexAdapter|> L[src/index.ts]
    A[Sources.test.ts] -->|creaUrlNormattivaDaUrn|> M[src/index.ts]
```

**Connecting to the Rest of the Codebase**
-----------------------------------------

The Sources module is designed to integrate seamlessly with other components in the codebase. It provides a standardized API for interacting with external data sources, ensuring consistency and accuracy across the application.

* The `Sources` module is imported by the main application entry point (`main.ts`)
* The `Sources` module is used throughout the application to access and process external data
* The `Sources` module is responsible for handling errors and exceptions related to data retrieval and processing

**Conclusion**
----------

The Sources module provides a critical component of the application's architecture, ensuring consistency and accuracy in the use of external data sources. Its standardized API and robust validation mechanisms make it an essential part of the codebase.