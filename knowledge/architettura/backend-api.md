---
type: Componente
title: Backend / API (Node)
description: Orchestrazione del flusso RAG e gestione dei documenti caricati, esposta come contratto in-process via IPC e non come server HTTP.
tags: [backend, node, typescript, rag]
timestamp: 2026-06-30T00:00:00Z
---

# Backend / API (Node / TypeScript)

Orchestrazione del flusso [RAG](../glossario/rag.md) (retrieval → costruzione contesto → generazione) e gestione dei documenti caricati. Vedi il [flusso di una domanda](./flusso-rag.md). Fa parte dello [stack TypeScript-first](./stack-tecnologico.md).

## «API» qui significa contratto in-process, non un server HTTP

Magistra è un'**app desktop locale e single-utente**: il backend **non** è un server HTTP/REST in ascolto su una porta.
In questi documenti «API» indica il **contratto dell'orchestrazione** — l'insieme tipizzato di operazioni che la UI può invocare (chat, retrieval, upload) — esposto tramite l'**IPC** di Electron, non un endpoint di rete.

Non aprire alcuna porta su `localhost` riduce la superficie d'attacco (vedi [sicurezza](../requisiti/sicurezza.md)) ed è coerente con la [privacy](../requisiti/privacy-e-dati-personali.md) e con un'app che gira interamente in locale; è anche la forma più semplice per un prodotto single-utente. Concretamente:

- Il [frontend](./frontend.md) (renderer) invoca le operazioni via IPC, non via `fetch` verso un server locale.
- L'orchestrazione gira nel processo principale o in una utility process di Electron.
- I contratti tra UI, backend e [worker](./worker-ingest.md) sono **tipizzati**: tipi TypeScript condivisi più validazione runtime ai confini (vedi le scelte di base nello [stack tecnologico](./stack-tecnologico.md)).

## Orchestrazione indipendente dal trasporto

Il **core di orchestrazione** è un modulo a sé, **indipendente dal trasporto**: espone un contratto tipizzato di operazioni invocabili direttamente, e l'IPC è solo un **adattatore sottile** che lo collega alla UI.
Così il core si esercita nei test senza passare dall'IPC, e il trasporto resta un dettaglio sostituibile — è il [principio dei confini dietro interfacce](./stack-tecnologico.md) applicato al confine UI ↔ backend.

## Cosa fa e cosa non fa

Il backend gestisce chat, orchestrazione del retrieval e upload, ma **non** esegue l'ingest completo del corpus, il parsing [AKN](../glossario/akoma-ntoso.md) pesante, l'embedding massivo o le reindicizzazioni estese: queste operazioni appartengono al [worker / runtime dei job](./worker-ingest.md), così l'assistente resta reattivo anche durante aggiornamenti o import complessi.

È **single-utente** e gira in locale: non gestisce account, login o multi-utenza.
