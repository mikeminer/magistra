# GazzettaUfficialeAdapter

**Normattiva Module Documentation**

**Overview**

The Normattiva module is responsible for fetching, processing, and converting Normattiva Open Data into a format suitable for use in the application. It provides a unified interface for accessing various sources of Normattiva data, including Gazzetta Ufficiale, EurLex, and Giurisprudenza Aperta.

**Key Components**

1. **NormattivaAdapter**: A class that serves as an adapter between the Normattiva module and other components of the application. It provides a standardized interface for accessing various sources of Normattiva data.
2. **GazzettaUfficialeAdapter**: A class that adapts Gazzetta Ufficiale data into a format suitable for use in the application.
3. **EurLexAdapter**: A class that adapts EurLex data into a format suitable for use in the application.
4. **GiurisprudenzaApertaAdapter**: A class that adapts Giurisprudenza Aperta data into a format suitable for use in the application.
5. **NormattivaOpenDataProcessor**: A class responsible for processing and converting Normattiva Open Data into a format suitable for use in the application.

**How it Works**

The Normattiva module follows these steps:

1. The `main` function in the `worker/src/cli.ts` file initializes the Normattiva module by calling the `leggiStatoIngestDaEnv` function.
2. The `leggiStatoIngestDaEnv` function fetches the current state of the ingestion process from the environment variables and calls the `fontiCatalogabili` function to retrieve a list of available fonti catalogabili.
3. The `fontiCatalogabili` function returns a list of available fonti catalogabili, which are then used to create instances of the corresponding adapters (e.g., GazzettaUfficialeAdapter, EurLexAdapter, etc.).
4. Each adapter is responsible for fetching and processing data from its respective source.
5. The processed data is then passed to the `NormattivaOpenDataProcessor` class, which converts it into a format suitable for use in the application.

**Connection to Other Components**

The Normattiva module connects to other components of the application through the following interfaces:

* **GazzettaUfficialeAdapter**: Exposed through the `get` function in the `ingest/status/route.ts` file.
* **EurLexAdapter**: Exposed through the `get` function in the `ingest/status/route.ts` file.
* **GiurisprudenzaApertaAdapter**: Exposed through the `get` function in the `ingest/status/route.ts` file.
* **NormattivaOpenDataProcessor**: Exposed through the `text` function in the `api/documents/route.ts` file.

**Mermaid Diagram**

```mermaid
graph LR
    A[main] -->|leggiStatoIngestDaEnv|> B[fontiCatalogabili]
    B -->|fontiCatalogabili|> C[GazzettaUfficialeAdapter]
    C -->|GazzettaUfficialeAdapter|> D[NormattivaOpenDataProcessor]
    B -->|fontiCatalogabili|> E[EurLexAdapter]
    E -->|EurLexAdapter|> F[NormattivaOpenDataProcessor]
    B -->|fontiCatalogabili|> G[GiurisprudenzaApertaAdapter]
    G -->|GiurisprudenzaApertaAdapter|> H[NormattivaOpenDataProcessor]
    A -->|NormattivaOpenDataProcessor|> I[text]
```

This diagram illustrates the flow of data from the `main` function to the `text` function, passing through various adapters and processors along the way.