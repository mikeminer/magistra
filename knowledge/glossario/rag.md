---
type: Termine
title: RAG (Retrieval-Augmented Generation)
description: Tecnica in cui l'LLM genera risposte basandosi su documenti recuperati da un indice, permettendo citazioni verificabili.
tags: [glossario, tecnico, rag]
timestamp: 2026-06-18T00:00:00Z
---

# RAG (Retrieval-Augmented Generation)

Tecnica in cui l'LLM genera risposte basandosi su documenti recuperati da un indice, anziché solo sulla memoria del modello. Permette [citazioni verificabili](/glossario/citazione-verificabile.md). Vedi il [flusso di una domanda](/architettura/flusso-rag.md).

La piattaforma adotta una variante **[agentica](/glossario/rag-agentico.md)**: l'LLM pianifica le query di ricerca e può iterare il retrieval, invece di cercare una sola volta sulla domanda grezza.
