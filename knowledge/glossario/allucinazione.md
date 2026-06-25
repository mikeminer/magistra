---
type: Termine
title: Allucinazione
description: Affermazione generata da un LLM che appare plausibile ma non è supportata dalle fonti (inventata o non aderente ai documenti recuperati); nel diritto è un rischio critico.
tags: [glossario, tecnico, qualita]
timestamp: 2026-06-25T00:00:00Z
---

# Allucinazione

Affermazione prodotta da un LLM che sembra plausibile ma **non è supportata dalle fonti**. Comprende due casi: l'invenzione di una fonte inesistente (es. un articolo o una sentenza che non esistono) e l'affermazione **non supportata dai documenti effettivamente recuperati**, anche quando la fonte esiste — quest'ultimo è il caso più insidioso in un sistema [RAG](/glossario/rag.md).

In ambito giuridico è il rischio principale: per questo la piattaforma vincola le risposte alle [citazioni verificabili](/glossario/citazione-verificabile.md) tramite il [flusso RAG](/architettura/flusso-rag.md) e ne misura la frequenza nella [valutazione della qualità](/requisiti/valutazione-qualita.md). L'opposto desiderato è la [groundedness](/glossario/groundedness.md).
