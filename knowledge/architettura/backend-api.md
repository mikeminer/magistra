---
type: Componente
title: Backend / API (Node)
description: API locale TypeScript su Node.js/Hono per chat, retrieval, streaming LLM e gestione dei documenti caricati.
tags: [backend, node, typescript, rag]
timestamp: 2026-06-30T00:00:00Z
---

# Backend / API (Node / TypeScript)

Orchestrazione del flusso [RAG](../glossario/rag.md) (retrieval → costruzione contesto → generazione) e gestione dei documenti caricati. Vedi il [flusso di una domanda](./flusso-rag.md). Fa parte dello [stack TypeScript-first](./stack-tecnologico.md).

Il processo API gestisce chat, orchestrazione del retrieval e upload, ma **non** esegue l'ingest completo del corpus, il parsing [AKN](../glossario/akoma-ntoso.md) pesante, l'embedding massivo o le reindicizzazioni estese: queste operazioni appartengono al [worker / runtime dei job](./worker-ingest.md), così l'assistente resta reattivo anche durante aggiornamenti o import complessi.

È **single-utente** e gira in locale: non gestisce account, login o multi-utenza.

## Runtime e framework

Decisione per l'MVP:

- runtime: **Node.js Active LTS**, con target iniziale Node 24 LTS;
- framework HTTP: **Hono** su Node.js;
- validazione dei contratti: **Zod**;
- generazione e streaming LLM: **AI SDK**;
- orchestrazione RAG: pipeline interna esplicita, non affidata a un framework generalista come dipendenza core.

Hono è scelto perché è leggero, TypeScript-first e basato su Web Standards (`Request`/`Response`). Questo mantiene l'API locale semplice da testare e lascia aperta la reversibilità verso altri runtime JavaScript se il packaging desktop lo richiede.

Zod è usato per validare input, output e payload interni ai confini tra frontend, API, worker e adapter. Gli schemi che diventano contratto pubblico del sistema devono vivere in moduli condivisi, non duplicati tra componenti.

AI SDK è usato per uniformare streaming, provider LLM e tool calling. Non sostituisce il retrieval giuridico: il modo in cui Magistra seleziona fonti, rispetta la vigenza, costruisce citazioni e decide un rifiuto resta logica applicativa del progetto.

## Pipeline RAG lato API

Il backend coordina il percorso interattivo:

1. riceve la domanda e il contesto dell'utente;
2. genera o normalizza le query di ricerca (vedi [pianificazione delle query](./pianificazione-query.md));
3. interroga l'[indice normativo](./indice-normativo.md) tramite adapter;
4. applica filtri, eventuale reranking e controlli su vigenza e citazioni;
5. costruisce il contesto passato al modello;
6. chiama il provider LLM tramite AI SDK;
7. restituisce risposta, citazioni e metadati di tracciabilità.

La pipeline deve rimanere osservabile: per ogni risposta vanno conservati o resi ispezionabili query generate, chunk usati, citazioni prodotte e motivi di rifiuto quando il corpus non supporta una risposta.

## Confini con worker e componenti non-TS

Il backend può invocare componenti non-TS solo tramite adapter con contratto esplicito: CLI, IPC, HTTP locale o libreria nativa incapsulata. Non deve importare dettagli del motore fisico dell'indice, del parser o del convertitore documentale dentro il dominio API.

Esempi ammessi dietro adapter:

- motore embedded dell'indice normativo;
- conversione documenti tramite processo locale;
- eventuali librerie native per parsing, ranking o embedding, se giustificate dai criteri di escape hatch dello [stack tecnologico](./stack-tecnologico.md).

Ogni adapter deve normalizzare errori, timeout e stato di indisponibilità in risposte gestibili dall'API, senza abbattere il processo interattivo.
