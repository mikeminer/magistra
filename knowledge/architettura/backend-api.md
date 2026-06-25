---
type: Componente
title: Backend / API (Node)
description: Orchestrazione del flusso RAG e gestione dei documenti caricati.
tags: [backend, node, typescript, rag]
timestamp: 2026-06-18T00:00:00Z
---

# Backend / API (Node / TypeScript)

Orchestrazione del flusso [RAG](/glossario/rag.md) (retrieval → costruzione contesto → generazione) e gestione dei documenti caricati. Vedi il [flusso di una domanda](/architettura/flusso-rag.md). Fa parte dello [stack TypeScript-first](/architettura/stack-tecnologico.md).

Il processo API gestisce chat, orchestrazione del retrieval e upload, ma **non** esegue l'ingest completo del corpus, il parsing [AKN](/glossario/akoma-ntoso.md) pesante, l'embedding massivo o le reindicizzazioni estese: queste operazioni appartengono al [worker / runtime dei job](/architettura/worker-ingest.md), così l'assistente resta reattivo anche durante aggiornamenti o import complessi.

È **single-utente** e gira in locale: non gestisce account, login o multi-utenza.
