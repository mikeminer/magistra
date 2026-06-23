---
type: Componente
title: Backend / API (TypeScript)
description: Runtime realtime per orchestrazione RAG, retrieval, import incrementale e gestione dei documenti caricati.
tags: [backend, node, typescript, rag, api]
timestamp: 2026-06-23T00:00:00Z
---

# Backend / API (TypeScript)

Orchestrazione del flusso [RAG](/glossario/rag.md) (retrieval → costruzione contesto → generazione) e gestione dei documenti caricati. Vedi il [flusso di una domanda](/architettura/flusso-rag.md).

Questa versione OSS è **single-utente** e self-hostata: non gestisce account, login o multi-utenza. L'autenticazione e la multi-tenancy sono previste solo per la versione cloud gestita.

La scelta di riferimento è descritta in [Scelta stack e runtime](/architettura/scelta-stack-runtime.md): Magistra OSS usa TypeScript come stack applicativo primario, con runtime separati per API realtime e job batch.

## Responsabilità

- Ricevere richieste di chat, ricerca e upload documenti.
- Pianificare query e orchestrare retrieval, reranking e costruzione del contesto.
- Interrogare [PostgreSQL + pgvector](/architettura/indice-normativo.md) come fonte locale primaria.
- Chiamare il [provider LLM](/architettura/provider-llm.md) solo dopo aver costruito un contesto citabile.
- Esporre stato, errori e risultati dei job gestiti dal worker.

## Recupero fonti mancanti

Il database locale è la prima fonte. Se non produce risultati utili, l'API può attivare un recupero online incrementale: ricerca la fonte, la importa nel database, ripete il retrieval locale e solo dopo genera la risposta con LLM.

La risposta finale deve essere un sunto prodotto dall'LLM a partire dalle fonti recuperate e citate. Non si risponde direttamente da risultati web non importati o non persistiti.

## Fuori dal processo API

Il processo API non esegue ingest completo del corpus, parsing AKN pesante, embedding massivo o reindicizzazioni estese. Queste operazioni appartengono al worker/job runtime, così l'assistente rimane reattivo anche durante aggiornamenti o import complessi.
