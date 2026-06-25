---
type: Termine
title: Vector DB
description: Database ottimizzato per ricerche su vettori (nel progetto, PGlite embedded con pgvector).
tags: [glossario, tecnico, vector-db]
timestamp: 2026-06-25T00:00:00Z
---

# Vector DB

Database ottimizzato per ricerche su vettori. Nel progetto è l'[indice normativo](/architettura/indice-normativo.md), realizzato con **PGlite embedded** (Postgres in WASM) e l'estensione `pgvector` — coerente con l'architettura locale, senza alcun servizio esterno.
