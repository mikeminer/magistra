---
type: Termine
title: RAG agentico
description: Variante di RAG in cui un agente LLM pianifica le query di ricerca e può iterare il retrieval, anziché eseguire una singola ricerca sulla domanda grezza.
tags: [glossario, tecnico, rag, agentico]
timestamp: 2026-06-20T00:00:00Z
---

# RAG agentico

Variante del [RAG](/glossario/rag.md) in cui l'LLM agisce come **agente** del recupero: prima di cercare, **ragiona** sulla richiesta e produce una o più query mirate (vedi [pianificazione delle query](/architettura/pianificazione-query.md)), e può **iterare** il retrieval se il contesto raccolto è insufficiente.

Si contrappone al RAG "ingenuo", che embedda la domanda grezza ed esegue una sola ricerca. Migliora recall e robustezza su domande vaghe o complesse. È l'approccio adottato nel [flusso di una domanda](/architettura/flusso-rag.md) dell'[assistente legale](/funzionalita/assistente-legale.md).
