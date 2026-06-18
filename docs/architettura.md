# Architettura

Bozza di architettura per Italian-OSS-Legal-Platform. In questa fase serve a orientare le scelte; non è ancora un'implementazione.

## Vista d'insieme

```
                 ┌─────────────────────────┐
   Utente ─────► │   Frontend (Next.js)     │
                 └───────────┬──────────────┘
                             │ API
                 ┌───────────▼──────────────┐
                 │   Backend / API (Node)    │
                 │  - orchestrazione RAG     │
                 │  - autenticazione         │
                 └───┬───────────────┬───────┘
                     │               │
        ┌────────────▼───┐     ┌─────▼────────────┐
        │ Vector DB       │     │ Object storage   │
        │ (PostgreSQL +   │     │ (MinIO, S3-comp.)│
        │  pgvector)      │     │ documenti utente │
        └────────────┬────┘     └──────────────────┘
                     │
        ┌────────────▼─────────────┐
        │ Indice normativo          │  ◄── pipeline di ingest
        │ (chunk + metadati ELI)    │      (vedi modello-dati.md)
        └───────────────────────────┘

   LLM (provider configurabile) ──► generazione risposte con citazioni
```

## Componenti

**Frontend (Next.js / TypeScript)**
Interfaccia di chat, ricerca, caricamento e visualizzazione documenti con citazioni cliccabili che rimandano alla fonte (ELI/Normattiva).

**Backend / API (Node / TypeScript)**
Orchestrazione del flusso RAG (retrieval → costruzione contesto → generazione), gestione utenti, gestione documenti caricati.

**Indice normativo + Vector DB**
PostgreSQL con `pgvector` per ricerca semantica e query strutturate sui metadati (filtri per tipo di atto, vigenza, ecc.). Alimentato dalla pipeline di ingest.

**Object storage (S3-compatibile: MinIO)**
Conserva i documenti caricati dagli utenti e gli artefatti di ingest. Si usa [MinIO](https://min.io/), object storage open source compatibile con l'API S3, eseguito in self-hosting tramite Docker Compose insieme al resto dello stack.

**Provider LLM (configurabile)**
Almeno un provider a scelta; obiettivo di lungo periodo: supportare modelli locali/self-hosted per privacy e sovranità dei dati.

## Flusso di una domanda (RAG)

1. L'utente pone una domanda in linguaggio naturale.
2. Il backend recupera i `Chunk` più rilevanti dall'indice (ricerca semantica + filtri).
3. Costruisce un contesto con i testi normativi e i relativi metadati di citazione.
4. L'LLM genera la risposta **citando** articolo, comma e fonte (ELI).
5. Il frontend mostra la risposta con i link verificabili alle fonti.

## Principi architetturali

- **Citazione prima di tutto**: nessuna risposta normativa senza fonte recuperata dall'indice.
- **Separazione dati/modello**: la qualità dipende dai dati e dal retrieval, non solo dall'LLM.
- **Self-hosting possibile**: l'architettura deve poter girare interamente sotto il controllo dell'utente.
- **Modularità**: provider LLM, storage e database intercambiabili.
