---
type: Componente
title: Indice normativo + Vector DB
description: PGlite embedded con pgvector per ricerca semantica e query strutturate sui metadati; alimentato dalla pipeline di ingest.
tags: [vector-db, pgvector, pglite, indice]
timestamp: 2026-06-25T00:00:00Z
---

# Indice normativo + Vector DB

Istanza **PGlite** embedded con `pgvector` ([Vector DB](../glossario/vector-db.md)) per [ricerca semantica](../glossario/ricerca-semantica.md) e query strutturate sui metadati (filtri per tipo di atto, [vigenza](../glossario/vigenza.md), ecc.). Alimentato dalla [pipeline di trasformazione](../modello-dati/pipeline-trasformazione.md) e popolato di [Chunk](../modello-dati/chunk.md).

Poiché `pgvector` gira anche in PGlite, l'indice può essere **distribuito già pronto** dentro il bundle dell'[app desktop](./deployment.md) e usato in locale senza servizi esterni.
