# Retrieval

**Retrieval Module Documentation**

**Overview**
------------

The Retrieval module is responsible for retrieving and processing data from various sources, including databases, APIs, and file systems. Its primary purpose is to provide a unified interface for accessing and managing data across different domains.

**How it Works**
-----------------

The Retrieval module consists of three main functions:

1.  **leggiStatoIngest**: Retrieves the current state of an ingest job from the database.
2.  **creaDatabaseDaEnv**: Creates a new database connection based on the environment variables provided.
3.  **leggiStatoIngestDaEnv**: Retrieves the current state of an ingest job from the environment variables and creates a new database connection if necessary.

Here's a high-level overview of how these functions interact:

*   The `leggiStatoIngest` function queries the database for the latest ingest job data.
*   If no data is found, it calls `creaDatabaseDaEnv` to create a new database connection and then retries the query.
*   If data is found, it processes the result and returns the state of the ingest job.

**Key Components**
------------------

### leggiStatoIngest

*   **Functionality**: Retrieves the current state of an ingest job from the database.
*   **Parameters**: `database` (QueryableDatabase)
*   **Returns**: StatoIngestApi
*   **Notes**: This function uses a SQL query to retrieve data from the database. If no data is found, it calls `creaDatabaseDaEnv` to create a new database connection and then retries the query.

### creaDatabaseDaEnv

*   **Functionality**: Creates a new database connection based on the environment variables provided.
*   **Parameters**: `env` (NodeJS.ProcessEnv)
*   **Returns**: pg.Client
*   **Notes**: This function uses the `pg` library to create a new database connection. If no connection string is provided, it throws an error.

### leggiStatoIngestDaEnv

*   **Functionality**: Retrieves the current state of an ingest job from the environment variables and creates a new database connection if necessary.
*   **Parameters**: `env` (NodeJS.ProcessEnv)
*   **Returns**: StatoIngestApi
*   **Notes**: This function checks if the `DATABASE_URL` environment variable is set. If it's not, it calls `creaDatabaseDaEnv` to create a new database connection and then retries the query.

**Connections to Other Modules**
------------------------------

The Retrieval module connects to other modules in the following ways:

*   **Backend**: The Retrieval module interacts with backend modules such as `leggiDocumentoUtente`, `leggiFonteDaDatabase`, `listaDocumentiUtente`, and `accodaReview` through the `creaDatabaseDaEnv` function.
*   **API**: The Retrieval module is called by the API server (`server.ts`) through the `leggiStatoIngestDaEnv` function.

**Mermaid Diagram**
------------------

```mermaid
graph LR
    A[GET (ingest/status/route.ts)] -->|leggiStatoIngestDaEnv| B[worker/src/status.ts]
    B -->|fontiCatalogabili| C[sources/src/index.ts]
    B -->|query| D[database/src/index.ts]
    E[NormattivaAdapter] --> F[creaRegistroFonti]
    G[GazzettaUfficialeAdapter] --> H[creaRegistroFonti]
    I[EurLexAdapter] --> J[creaRegistroFonti]
    K[Query] --> L[creaRegistroFonti]
```

This Mermaid diagram illustrates the flow of data from the API server to the Retrieval module and then to other modules in the codebase. It shows how the `leggiStatoIngestDaEnv` function interacts with other functions and modules, including fontiCatalogabili, query, NormattivaAdapter, GazzettaUfficialeAdapter, EurLexAdapter, and Query.

**Conclusion**
----------

The Retrieval module provides a unified interface for accessing and managing data across different domains. Its key components include the `leggiStatoIngest`, `creaDatabaseDaEnv`, and `leggiStatoIngestDaEnv` functions, which work together to retrieve and process data from various sources. The module connects to other modules in the codebase through the `creaDatabaseDaEnv` function and is called by the API server through the `leggiStatoIngestDaEnv` function.