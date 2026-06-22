---
type: Termine
title: Reranking
description: Riordino dei risultati di una ricerca per rilevanza, applicato dopo il recupero iniziale per migliorare la qualità del contesto.
tags: [glossario, tecnico, retrieval]
timestamp: 2026-06-20T00:00:00Z
---

# Reranking

Fase di **riordino** dei risultati di una ricerca: dopo aver recuperato un primo insieme di [chunk](/modello-dati/chunk.md) candidati (per [ricerca semantica](/glossario/ricerca-semantica.md) o per parola chiave), un secondo modello li riordina per rilevanza rispetto alla domanda.

Migliora la qualità del contesto passato all'LLM nel [flusso RAG](/architettura/flusso-rag.md) ed è uno dei fattori misurati nella [valutazione della qualità](/requisiti/valutazione-qualita.md). Usato dalla [ricerca normativa](/funzionalita/ricerca-normativa.md) in modalità ibrida.
