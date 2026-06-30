---
type: Concetto
title: Stack tecnologico
description: Scelta di uno stack TypeScript-first end-to-end per Magistra, con motivazioni e confini per l'eventuale uso di altri runtime.
tags: [stack, typescript, oss, architettura]
timestamp: 2026-06-30T00:00:00Z
---

# Stack tecnologico

Magistra adotta uno **stack applicativo TypeScript-first**: lo stesso linguaggio per il [frontend](./frontend.md), il [backend / API](./backend-api.md), il [worker di ingest](./worker-ingest.md), il tooling e l'app desktop.

Questa è la scelta di base per la prima release: il codice applicativo resta in TypeScript, mentre eventuali motori embedded, binari locali o runtime diversi entrano solo dietro un confine esplicito.

## Perché TypeScript-first

Il prodotto richiede oggi soprattutto retrieval, orchestrazione, indicizzazione, chat, integrazioni, frontend e distribuzione desktop: nessuna di queste aree impone un altro runtime.
La scelta è guidata dalla natura **open source** del progetto:

- **Accessibilità per la community**: TypeScript/JavaScript è familiare a una platea molto ampia di contributor, il che abbassa la barriera d'ingresso per chi vuole contribuire a UI, API, worker e tooling.
- **Onboarding più semplice**: un solo linguaggio significa meno contesto mentale, meno stack da mantenere e maggiore coerenza tra i componenti.
- **Codice e tipi condivisi**: i contratti dei dati possono essere condivisi tra frontend, backend e app desktop.
- **App desktop**: uno stack JS facilita la distribuzione come [app desktop](./deployment.md), dove l'intero bundle — UI, dati e logica — viene impacchettato insieme. Il candidato è **Electron**, che mantiene tutto il guscio in TypeScript.

## Scelte tecniche di base

| Area | Scelta | Motivazione |
| --- | --- | --- |
| Linguaggio applicativo | TypeScript | Un solo linguaggio per UI, API, worker, tooling e desktop. |
| Runtime applicativo | Node.js Active LTS, target iniziale Node 24 LTS | Stabilità LTS, compatibilità npm, integrazione naturale con Electron e tooling locale. |
| Package manager | npm con lockfile versionato | È già lo standard del repository e riduce variabili di setup per i contributor. |
| Frontend | Next.js / React / TypeScript | UI documentale e chat, componentizzazione e compatibilità con packaging desktop. |
| API locale | Hono su Node.js | Framework leggero, TypeScript-first, basato su Web Standards e portabile tra runtime JS. |
| Contratti e validazione | Zod | Schemi condivisibili tra API, frontend, worker e test, con validazione runtime dei dati esterni. |
| LLM e streaming | AI SDK | Toolkit TypeScript provider-agnostic per streaming, tool calling e integrazione con più provider LLM. |
| Orchestrazione RAG | Pipeline interna esplicita | Il retrieval giuridico richiede controllo su query planning, fonti, citazioni, vigenza e refusal. |
| Job batch | Worker Node.js separato dall'API | Isola ingest, embedding massivo e reindicizzazione dal percorso interattivo dell'assistente. |
| Desktop | Electron come candidato principale | Mantiene UI e runtime applicativo nello stack TypeScript-first. La scelta finale è trattata nel design di packaging. |

LangChain o LlamaIndex non sono dipendenze core per l'MVP: possono essere valutati come adapter o strumenti sperimentali, ma la logica di retrieval, selezione fonti e costruzione delle citazioni deve restare leggibile nel dominio Magistra.

## Confini ed escape hatch

Il default è TypeScript, ma se emergerà un requisito **concreto** che rende un altro runtime (Python, Rust, …) nettamente più adatto per un componente specifico, quel componente potrà essere introdotto con un **confine chiaro** rispetto al resto.
La scelta del linguaggio del backend resta inoltre **reversibile**: conta di più documentare bene i confini tra API, retrieval e ingest che imporre un unico runtime per comodità.

Va anche riconosciuto che lo stack non è "puro" per natura: alcune operazioni si appoggiano comunque a processi esterni, ad esempio LibreOffice headless per la [conversione documenti](./conversione-documenti.md). Questi sottoprocessi locali sono parte legittima dell'architettura.

L'escape hatch si attiva solo quando almeno una di queste condizioni è dimostrata:

- un requisito di performance, memoria, footprint o correttezza non è raggiungibile in modo ragionevole nello stack TypeScript;
- esiste una libreria o un motore non-TS significativamente più maturo per quel compito;
- il componente richiede API native di sistema o formati binari non gestibili bene in JS;
- il costo di manutenzione del componente non-TS resta più basso del costo di replicarlo in TypeScript.

Ogni escape hatch deve avere:

- contratto stabile verso il resto dell'app, via CLI, IPC, HTTP locale o adapter TypeScript;
- input/output tipizzati e validati;
- test riproducibili e benchmark quando la motivazione è prestazionale;
- responsabilità di packaging esplicita per Windows, macOS e Linux;
- licenza compatibile con AGPL e verifica supply-chain;
- fallback, degradazione o messaggio d'errore chiaro quando il componente non è disponibile.

## Cosa NON dipende dal linguaggio

La separazione architetturale tra API in tempo reale e job batch (vedi [worker di ingest](./worker-ingest.md)) è indipendente dalla scelta del linguaggio: vale a prescindere dal runtime adottato.
Allo stesso modo, l'**igiene delle dipendenze** è una disciplina trasversale e non una proprietà del linguaggio: i registri di pacchetti (npm come PyPI) condividono la stessa classe di rischi di supply-chain (typosquatting, script di installazione malevoli). Vedi [sicurezza](../requisiti/sicurezza.md).

## Componenti e relativo linguaggio

- [Frontend](./frontend.md): TypeScript / Next.js.
- [Backend / API](./backend-api.md): TypeScript / Node.js Active LTS / Hono.
- [Worker di ingest](./worker-ingest.md): TypeScript / Node, processo separato dall'API.
- [Database applicativo](./database-applicativo.md) e [indice normativo](./indice-normativo.md): motori embedded/locali dietro adapter TypeScript. La scelta fisica del motore segue i requisiti dei rispettivi documenti di architettura.
- Retrieval e RAG: pipeline TypeScript interna, con AI SDK per generazione/streaming e adapter verso provider LLM.
- App desktop: Electron (candidato), interamente in TypeScript.
