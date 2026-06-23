---
type: Componente
title: Indice normativo + Vector DB
description: PostgreSQL con pgvector per ricerca semantica e query strutturate sui metadati; alimentato dalla pipeline di ingest e da import incrementali.
tags: [vector-db, pgvector, postgresql, indice, corpus]
timestamp: 2026-06-23T00:00:00Z
---

# Indice normativo + Vector DB

PostgreSQL con `pgvector` ([Vector DB](/glossario/vector-db.md)) per [ricerca semantica](/glossario/ricerca-semantica.md) e query strutturate sui metadati (filtri per tipo di atto, [vigenza](/glossario/vigenza.md), ecc.). Alimentato dalla [pipeline di trasformazione](/modello-dati/pipeline-trasformazione.md) e popolato di [Chunk](/modello-dati/chunk.md).

Il database locale è la fonte primaria del [flusso RAG](/architettura/flusso-rag.md). Se una domanda non trova fonti sufficienti, il sistema può importare fonti online mancanti, persisterle qui e ripetere il retrieval prima della risposta LLM.

## Corpus pre-ingestato

Per la distribuzione desktop e self-hosted orientata all'utente finale, il corpus principale viene preparato dai maintainer e distribuito come database già popolato o snapshot aggiornabile. L'ingest completo non è un'operazione ordinaria da eseguire su ogni installazione.

Gli import runtime sono incrementali, tracciabili e limitati alle fonti necessarie a rispondere o aggiornare una parte del corpus.
