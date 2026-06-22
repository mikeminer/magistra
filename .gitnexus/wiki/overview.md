# Italian-OSS-Legal-Platform — Wiki

## Italian OSS Legal Platform Overview

The Italian OSS Legal Platform is an open-source, cloud-native platform designed to support research and analysis of Italian law. The platform provides a robust infrastructure for managing, processing, and retrieving legal data, with a focus on accuracy, scalability, and user experience.

### Architecture Overview

The platform's architecture consists of several interconnected modules, each responsible for a specific function:

*   **Sources**: Manages external data sources, such as Normattiva, EurLex, Gazzetta Ufficiale, and Giurisprudenza Aperta.
*   **Retrieval**: Retrieves relevant data from various sources and processes it for use in the platform.
*   **Ingest**: Collects and normalizes data from multiple sources, making it accessible for downstream applications.
*   **Database**: Manages data storage and retrieval, providing a unified interface for interacting with various databases.
*   **EmbeddingProvider**: Generates embeddings, which are numerical representations of input strings, used in various applications such as text classification, clustering, and information retrieval.

### Key End-to-End Flows

The platform supports several key end-to-end flows:

*   **GET → AsRecord** (cross_community): Retrieves data from sources, processes it, and returns it as a record.
*   **PreparaCorpusConEmbedding → AsRecord** (cross_community): Prepares the corpus with embeddings, retrieves data, and returns it as a record.
*   **CercaCorpusLegale → AsRecord** (cross_community): Searches for relevant data in the corpus, processes it, and returns it as a record.
*   **RispondiConFontiRag → AsRecord** (cross_community): Responds to queries with relevant data from sources, processes it, and returns it as a record.

### Mermaid Architecture Diagram

```mermaid
graph LR
    title Italian OSS Legal Platform Architecture
    Sources[Sources] -->|data source|> Retrieval[Retrieval]
    Retrieval -->|processed data|> Ingest[Ingest]
    Ingest -->|normalized data|> Database[Database]
    Database -->|stored data|> EmbeddingProvider[EmbeddingProvider]
    EmbeddingProvider -->|embeddings|> Evaluation[Evaluation]
    Evaluation -->|evaluated data|> OpzioniRetrievalIbrido[OpzioniRetrievalIbrido]
    OpzioniRetrievalIbrido -->|processed data|> Retrieval[Retrieval]
    Retrieval -->|returned data|> AsRecord[AsRecord]
```

### Setup Instructions

To set up the platform, follow these steps:

1.  Clone the repository using `git clone https://github.com/italian-oss-legal-platform.git`.
2.  Install the required dependencies by running `npm install` or `yarn install`.
3.  Start the platform by running `npm start` or `yarn start`.

Note: This is a high-level overview of the project, and for more detailed information on each module, please refer to the individual module documentation pages.

[Sources](sources/src/index.md)
[Retrieval](retrieval/src/index.ts)
[Ingest](ingest/src/index.ts)
[Database](database/src/index.ts)
[EmbeddingProvider](embedding-provider/src/index.ts)
[Evaluation](evaluation/src/index.ts)
[OpzioniRetrievalIbrido](opzioni-retrieval-ibrido/src/index.ts)