# Other — retrieval

**Retrieval Module Documentation**

**Overview**
------------

The Retrieval module is responsible for retrieving relevant data from various sources, such as corpora, databases, and APIs, to support the legal platform's functionality. It provides a unified interface for accessing this data, allowing developers to build applications that can query and retrieve information efficiently.

**Purpose**
----------

The primary purpose of the Retrieval module is to provide a robust and scalable way to retrieve relevant data from various sources, enabling the development of intelligent applications that can answer complex questions and provide insights based on legal knowledge.

**How it Works**
----------------

The Retrieval module uses a combination of natural language processing (NLP) techniques and machine learning algorithms to analyze user queries and identify relevant data sources. The module consists of several key components:

*   **Corpus**: A collection of documents, articles, and other written content that are used as training data for the NLP models.
*   **Database**: A repository of structured data that is used to store and retrieve information related to specific topics or domains.
*   **APIs**: External APIs that provide access to additional data sources, such as news articles, academic papers, or government reports.

The Retrieval module uses a hybrid approach to retrieve relevant data:

1.  **Exact Match**: The module first searches for exact matches between the user query and the corpus or database.
2.  **Fuzzy Matching**: If no exact match is found, the module uses fuzzy matching techniques to find similar phrases or words in the corpus or database.
3.  **Ranking**: The retrieved data is then ranked based on relevance, confidence, and other factors to provide the most accurate results.

**Key Components**
-----------------

The Retrieval module consists of several key components:

*   **`cercaCorpusLegaleIbrido`**: A function that retrieves data from a hybrid corpus, which combines multiple sources of information.
*   **`cercaCorpusLegale`**: A function that retrieves data from a single corpus or database.
*   **`getCorpusDimostrativo`**: A function that returns a demonstration corpus for testing and development purposes.
*   **`rispondiConFonti`**: A function that generates a response based on the retrieved data, including citations and references.
*   **`rispondiConFontiRag`**: A function that generates a response with additional features, such as model, embedding, and review human.

**Call Graph & Execution Flows**
--------------------------------

The Retrieval module has the following outgoing calls:

```mermaid
graph LR
    sub graph retrieval.test.ts (retrieval/test/retrieval.test.ts) {
        A[cercaCorpusLegaleIbrido] --> B[rispondiConFontiRag]
        A[getCorpusDimostrativo] --> C[rispondiConFonti]
        A[cercaCorpusLegale] --> D[rispondiConFonti]
    }
    sub graph retrieval/src/index.ts (retrieval/src/index.ts) {
        E[cercaCorpusLegaleIbrido] --> F[cercaCorpusLegale]
        E[getCorpusDimostrativo] --> G[cercaCorpusLegale]
        E[rispondiConFontiRag] --> H[rispondiConFonti]
    }
```

**Connections to the Rest of the Codebase**
------------------------------------------

The Retrieval module connects to other parts of the codebase through various APIs and interfaces:

*   **`@italian-oss-legal-platform/domain`**: The Retrieval module uses this domain-specific library to access domain knowledge and provide more accurate results.
*   **`@italian-oss-legal-platform/ingest`**: The Retrieval module uses this ingestion library to process and integrate data from various sources.

**Conclusion**
----------

The Retrieval module is a critical component of the legal platform, providing a unified interface for accessing relevant data from various sources. Its hybrid approach to retrieval, combining exact match, fuzzy matching, and ranking, enables it to provide accurate results even in complex queries. By understanding how the Retrieval module works and its key components, developers can build applications that leverage this powerful functionality to answer complex questions and provide insights based on legal knowledge.