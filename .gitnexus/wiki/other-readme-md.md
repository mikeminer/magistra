# Other — README.md

**Magistra OS Architecture**
==========================

**Overview**
------------

Magistra OS is an open-source, self-hosted platform for research in Italian law with verifiable citations. It serves as an assistant for research in Italian law, requiring verifiable citations for public sources.

**Architecture Components**
-------------------------

### 1. Backend (Express TypeScript)

The backend is built using Node.js and TypeScript, providing APIs for:

*   **Domande**: Handling user queries
*   **Fonti**: Managing source data
*   **Stato Ingest**: Tracking ingest operations
*   **Documenti Utente**: Managing user documents
*   **Review Umana**: Handling human review

### 2. Frontend (Next.js)

The frontend is built using Next.js, providing a console for:

*   **Domande-Risposte**: Displaying query results
*   **Fonti Recuperate**: Showing retrieved sources
*   **Viewer del Documento Sorgente**: Viewing source documents

### 3. Domain Layer (Packages/domain)

The domain layer provides types and invariant checks for:

*   **Norma**: Normative acts
*   **Versione**: Versions
*   **Manifestazione**: Manifestations
*   **Item Fonte**: Source items
*   **Unità**: Units
*   **Chunk**: Chunks
*   **Citazioni**: Citations

### 4. Ingest (Packages/ingest)

The ingest package handles:

*   **Parser Normattiva Multivigenza**: Parsing Normativa data
*   **Generazione Chunk Citabili**: Generating citable chunks
*   **Comando Locale per Prodotto Manifesti JSON**: Producing manifest JSON

### 5. Retrieval (Packages/retrieval)

The retrieval package provides:

*   **Ricerca Locale con Filtri**: Local search with filters
*   **Retrieval Ibrido con Embedding Deterministici**: Hybrid retrieval with deterministic embeddings

### 6. LLM (Packages/llm)

The LLM package handles:

*   **Contratti Provider per Embedding e Risposta**: Providing embedding and response contracts
*   **Stub Locale Citazionale e Provider OpenAI Compatibile Sostituibile**: Local citational stub and OpenAI compatible provider

### 7. Sources (Packages/sources)

The sources package manages:

*   **Registro Fonti Normattiva, EUR-Lex, Gazzetta Ufficiale e Giurisprudenza Aperta**: Registering Normattiva, EUR-Lex, Gazzetta Ufficiale, and open justice sources
*   **Policy di Riuso e Download AKN Consentito**: Policy for reuse and download of AKN

### 8. Worker (Packages/worker)

The worker package handles:

*   **Migrazioni**: Migrations
*   **Ingest Persistito**: Persistent ingest
*   **Archiviazione Fonti e Stato Job**: Archiving sources and job state
*   **Ingest da URL Normattiva e Scheduler Periodico**: Ingest from Normattiva URLs and periodic scheduler

### 9. Evaluation (Packages/evaluation)

The evaluation package provides:

*   **Dataset Minimo di Domande Attese e Metriche di Copertura Citazioni**: Minimum dataset for queries and coverage metrics of citations

### 10. Database (Packages/database)

The database package manages:

*   **Migrazioni SQL e Mappatura Tipizzata verso PostgreSQL + pgvector**: SQL migrations and typed mapping to PostgreSQL + pgvector
*   **Upsert Runtime, Workflow Review, Documenti Utente e Policy Fonte**: Upsert runtime, review workflow, user documents, and source policy

**Mermaid Diagram: Architecture**
```mermaid
graph LR
    backend[Backend (Express TypeScript)] -->|APIs|> frontend[Frontend (Next.js)]
    backend -->|Ingest|> ingest[Ingest Package]
    backend -->|Retrieval|> retrieval[Retrieval Package]
    backend -->|LLM|> llm[LLM Package]
    backend -->|Sources|> sources[Sources Package]
    backend -->|Worker|> worker[Worker Package]
    backend -->|Evaluation|> evaluation[Evaluation Package]
    backend -->|Database|> database[Database Package]

    frontend -->|Console|> console
    frontend -->|Fonti Recuperate|> frontend[Frontend (Next.js)]

    ingest -->|Parser Normattiva Multivigenza|> parser[Normattiva Parser]
    ingest -->|Generazione Chunk Citabili|> chunk[Chunk Generator]

    retrieval -->|Ricerca Locale con Filtri|> search[Search Service]
    retrieval -->|Retrieval Ibrido con Embedding Deterministici|> hybrid[Hybrid Retrieval Service]

    llm -->|Contratti Provider per Embedding e Risposta|> embedding[Embedding Contract]
    llm -->|Stub Locale Citazionale e Provider OpenAI Compatibile Sostituibile|> openai[OpenAI Compatible Provider]

    sources -->|Registro Fonti Normattiva, EUR-Lex, Gazzetta Ufficiale e Giurisprudenza Aperta|> normattiva[Normattiva Source Register]
    sources -->|Policy di Riuso e Download AKN Consentito|> policy[AKN Reuse Policy]

    worker -->|Migrazioni|> migration[Migration Service]
    worker -->|Ingest Persistito|> ingest[Ingest Service]
    worker -->|Archiviazione Fonti e Stato Job|> storage[Storage Service]
    worker -->|Scheduler Periodico|> scheduler[Scheduler Service]

    evaluation -->|Dataset Minimo di Domande Attese e Metriche di Copertura Citazioni|> dataset[Dataset Service]
```
**Development Workflow**
----------------------

### 1. Installazione

```bash
npm install
```

### 2. Controllo dei Codici

```bash
npm run check
```

### 3. Avvio dello Sviluppo

```bash
npm run dev
```

### 4. Generazione Manifesti Ingest Locali

```bash
npm run ingest:esempio
```

### 5. Archiviazione XML Originali

```bash
npm run ingest:esempio -- --archive-sources
```

### 6. Valutazione Locale del Retrieval Citabile

```bash
npm run evaluate
```

### 7. Migrazione Worker Persistito

```bash
npm run worker:migrate
```

### 8. Scheda Periodica

```bash
npm run worker:schedule
```

### 9. Stato Job

```bash
npm run worker:status
```
**Nota Legale**
---------------

Questo progetto fornisce informazioni giuridiche con fonti tracciabili. Non fornisce consulenza legale.