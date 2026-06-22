# Other — ROADMAP.md

**Magistra OS Knowledge Base Roadmap**

The Magistra OS knowledge base roadmap is a comprehensive guide that outlines the development plan for the Magistra OS project's knowledge base. The roadmap provides a clear direction for the project, ensuring that all stakeholders are aligned and working towards a common goal.

**Purpose**

The primary purpose of this roadmap is to provide a structured approach to developing the Magistra OS knowledge base. It ensures that the project stays on track, meets its objectives, and delivers high-quality results.

**How it Works**

The roadmap is divided into seven phases, each representing a significant milestone in the development process. The phases are:

1. **Fondazione Repository e Documentazione**: This phase focuses on setting up the foundation for the knowledge base, including creating the repository, writing documentation, and establishing a workflow for contributions.
2. **Roadmap**: In this phase, we create the roadmap itself, outlining the key components, milestones, and timelines for each phase.
3. **Interfaccia**: We develop the user interface (UI) for the knowledge base, including the shell applicativa Next.js, chat interface, search functionality, and viewer fonti with anchor articolo e comma.
4. **Servizi**: In this phase, we create the backend services, including the API orchestration RAG, job ingest service, and interfaccia fornitore LLM.
5. **Dati E Ingest**: We develop the data ingestion pipeline, including the adapter Normattiva, parser AKN, and normalizzazione testo.
6. **Infrastruttura**: This phase focuses on setting up the infrastructure, including PostgreSQL + pgvector, snapshot database tipizzato, archiviazione oggetti MinIO, Docker Compose, CI, migrazioni, backup, and health check.
7. **Qualità**: In the final phase, we focus on ensuring the quality of the knowledge base, including test unitari e di integrazione, corpus di esempio Legge 241/1990, and controlli UX su sicurezza e assenza di consulenza legale.

**Key Components**

The Magistra OS knowledge base roadmap consists of several key components:

* **Adapter Normattiva**: An adapter that connects to the Normattiva Open Data platform, providing access to Italian legislation.
* **Parser AKN**: A parser that extracts relevant information from AKN documents, including articles and sections.
* **Normalizzazione Testo**: A normalization process that standardizes text data, ensuring consistency across the knowledge base.
* **Pipeline Chunking ed Embedding**: A pipeline that chunks and embeds data, enabling efficient storage and retrieval of the knowledge base.

**Connections to the Rest of the Codebase**

The Magistra OS knowledge base roadmap connects to other parts of the codebase through several interfaces:

* **API Orchestration RAG**: The API orchestration service is used to manage the knowledge base's backend services.
* **Job Ingest Service**: The job ingest service is responsible for processing and ingesting data into the knowledge base.
* **Interfaccia Fornitore LLM**: The interfaccia fornitore LLM provides access to the language model, enabling natural language processing tasks.

**Mermaid Diagram**

```mermaid
graph LR
    A[Adapter Normattiva] -->|connection|> B[Parser AKN]
    B -->|output|> C[Normalizzazione Testo]
    C -->|output|> D[Pipeline Chunking ed Embedding]
    D -->|output|> E[Knowledge Base]
    F[API Orchestration RAG] -->|management|> G[Backend Services]
    H[Job Ingest Service] -->|processing|> I[Data]
    J[Interfaccia Fornitore LLM] -->|access|> K[Language Model]
```

This Mermaid diagram illustrates the connections between the key components of the Magistra OS knowledge base roadmap, providing a visual representation of how they interact and depend on each other.