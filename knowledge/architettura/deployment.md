---
type: Processo
title: Deployment e self-hosting
description: Come la piattaforma viene installata ed eseguita come desktop app, self-hosted locale o deployment gestito.
tags: [deployment, self-hosting, configurazione, desktop]
timestamp: 2026-06-23T00:00:00Z
---

# Deployment e self-hosting

Descrive come si mette in esecuzione la piattaforma. Obiettivo: poter girare **interamente sotto il controllo dell'utente** ([self-hosting](/glossario/self-hosting.md)), così che i documenti non lascino il suo ambiente. È una versione **single-utente**, pensata per essere installata su un proprio computer o server: niente account né login.

La direzione di prodotto prevede due modalità OSS principali: una desktop app per utenti finali e un setup self-hosted per contributor o installazioni tecniche.

## Desktop app Windows

La desktop app è un bundle di prodotto, non un semplice client. Deve includere l'interfaccia, il runtime locale necessario, la configurazione guidata e un database inizializzato da un corpus normativo pre-ingestato o da uno snapshot verificabile.

Principi:

- l'utente può usare Magistra subito dopo l'installazione;
- non è richiesto re-ingestare tutto il corpus Normattiva sul device dell'utente;
- gli aggiornamenti del corpus sono incrementali e verificabili;
- eventuali fonti online mancanti vengono importate nel database locale prima della generazione LLM;
- la shell desktop può essere Electron, in linea con la scelta [TypeScript-first](/architettura/scelta-stack-runtime.md).

## Self-hosted tecnico

Per sviluppo, contributor e installazioni server, il setup resta semplice: pochi processi, stesso repository, configurazione via ambiente.

Componenti minimi:

- frontend web;
- [API / RAG runtime](/architettura/backend-api.md);
- worker/job runtime per import, aggiornamenti, chunking ed embedding;
- [PostgreSQL + pgvector](/architettura/indice-normativo.md);
- object storage opzionale per documenti utente.

## Componenti da mettere in esecuzione

- [Frontend](/architettura/frontend.md), [backend](/architettura/backend-api.md) e worker/job runtime.
- [Database applicativo](/architettura/database-applicativo.md) e [indice normativo](/architettura/indice-normativo.md) (PostgreSQL + pgvector).
- [Object storage](/architettura/object-storage.md) compatibile S3.

## Configurazione (via ambiente)

- Credenziali di database e storage.
- Chiavi di [cifratura](/glossario/cifratura.md) dei segreti (vedi [sicurezza](/requisiti/sicurezza.md)).
- [API key](/architettura/gestione-api-key.md) dei [provider LLM](/architettura/provider-llm.md).

I segreti sono forniti via ambiente e **non versionati**. Lo schema del database evolve con migrazioni versionate.

> Bozza concettuale: container, installer desktop e script di setup sono strumenti di packaging. La regola architetturale stabile è separare il runtime realtime dai job batch.
