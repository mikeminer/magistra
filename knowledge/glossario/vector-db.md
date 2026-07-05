---
type: Termine
title: Vector DB
description: Database ottimizzato per ricerche su vettori (nel progetto, LanceDB embedded per l'indice del corpus).
tags: [glossario, tecnico, vector-db]
timestamp: 2026-06-30T00:00:00Z
---

# Vector DB

Database ottimizzato per ricerche su vettori. Nel progetto è l'[indice normativo](../architettura/indice-normativo.md), realizzato con **LanceDB** embedded (motore nativo disk-based) — distinto da PGlite (il [database applicativo](../architettura/database-applicativo.md)) e coerente con l'architettura locale, senza alcun servizio esterno.
