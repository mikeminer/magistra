---
type: Concetto
title: Stack tecnologico
description: Scelta di uno stack TypeScript-first end-to-end per Magistra, con motivazioni e confini per l'eventuale uso di altri runtime.
tags: [stack, typescript, oss, architettura]
timestamp: 2026-06-25T00:00:00Z
---

# Stack tecnologico

Magistra adotta uno **stack applicativo TypeScript-first**: lo stesso linguaggio per il [frontend](/architettura/frontend.md), il [backend / API](/architettura/backend-api.md), il [worker di ingest](/architettura/worker-ingest.md), il tooling e l'app desktop.

> Bozza concettuale: questa è la direzione tecnica decisa, non un vincolo ideologico. Le scelte di librerie e strumenti specifici sono demandate al documento di design.

## Perché TypeScript-first

Il prodotto richiede oggi soprattutto retrieval, orchestrazione, indicizzazione, chat, integrazioni, frontend e distribuzione desktop: nessuna di queste aree impone un altro runtime.
La scelta è guidata dalla natura **open source** del progetto:

- **Accessibilità per la community**: TypeScript/JavaScript è familiare a una platea molto ampia di contributor, il che abbassa la barriera d'ingresso per chi vuole contribuire a UI, API, worker e tooling.
- **Onboarding più semplice**: un solo linguaggio significa meno contesto mentale, meno stack da mantenere e maggiore coerenza tra i componenti.
- **Codice e tipi condivisi**: i contratti dei dati possono essere condivisi tra frontend, backend e app desktop.
- **App desktop**: uno stack JS facilita la distribuzione come [app desktop](/architettura/deployment.md), dove l'intero bundle — UI, dati e logica — viene impacchettato insieme. Il candidato è **Electron**, che mantiene tutto il guscio in TypeScript.

## Non è una scelta ideologica: confini ed escape hatch

Il default è TypeScript, ma se emergerà un requisito **concreto** che rende un altro runtime (Python, Rust, …) nettamente più adatto per un componente specifico, quel componente potrà essere introdotto con un **confine chiaro** rispetto al resto.
La scelta del linguaggio del backend resta inoltre **reversibile**: conta di più documentare bene i confini tra API, retrieval e ingest che imporre un unico runtime per comodità.

Va anche riconosciuto che lo stack non è "puro" per natura: alcune operazioni si appoggiano comunque a processi esterni, ad esempio LibreOffice headless per la [conversione documenti](/architettura/conversione-documenti.md). Questi sottoprocessi locali sono parte legittima dell'architettura.

## Cosa NON dipende dal linguaggio

La separazione architetturale tra API in tempo reale e job batch (vedi [worker di ingest](/architettura/worker-ingest.md)) è indipendente dalla scelta del linguaggio: vale a prescindere dal runtime adottato.
Allo stesso modo, l'**igiene delle dipendenze** è una disciplina trasversale e non una proprietà del linguaggio: i registri di pacchetti (npm come PyPI) condividono la stessa classe di rischi di supply-chain (typosquatting, script di installazione malevoli). Vedi [sicurezza](/requisiti/sicurezza.md).

## Componenti e relativo linguaggio

- [Frontend](/architettura/frontend.md): TypeScript / Next.js.
- [Backend / API](/architettura/backend-api.md): TypeScript / Node.
- [Worker di ingest](/architettura/worker-ingest.md): TypeScript / Node, processo separato dall'API.
- [Database applicativo](/architettura/database-applicativo.md) e [indice normativo](/architettura/indice-normativo.md): PGlite embedded (Postgres in WASM con `pgvector`) come source of truth.
- App desktop: Electron (candidato), interamente in TypeScript.
