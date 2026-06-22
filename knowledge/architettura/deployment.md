---
type: Processo
title: Deployment e self-hosting
description: Come la piattaforma viene installata ed eseguita, con configurazione via ambiente e possibilità di esecuzione interamente self-hosted.
tags: [deployment, self-hosting, configurazione]
timestamp: 2026-06-20T00:00:00Z
---

# Deployment e self-hosting

Descrive come si mette in esecuzione la piattaforma. Obiettivo: poter girare **interamente sotto il controllo dell'utente** ([self-hosting](/glossario/self-hosting.md)), così che i documenti non lascino il suo ambiente. È una versione **single-utente**, pensata per essere installata su un proprio computer o server: niente account né login. L'applicazione si ottiene clonando il repository e si avvia su server propri o sulle proprie macchine.

## Componenti da mettere in esecuzione

- [Frontend](/architettura/frontend.md) e [backend](/architettura/backend-api.md).
- [Database applicativo](/architettura/database-applicativo.md) e [indice normativo](/architettura/indice-normativo.md) (PostgreSQL + pgvector).
- [Object storage](/architettura/object-storage.md) compatibile S3.

## Configurazione (via ambiente)

- Credenziali di database e storage.
- Chiavi di [cifratura](/glossario/cifratura.md) dei segreti (vedi [sicurezza](/requisiti/sicurezza.md)).
- [API key](/architettura/gestione-api-key.md) dei [provider LLM](/architettura/provider-llm.md).

I segreti sono forniti via ambiente e **non versionati**. Lo schema del database evolve con migrazioni versionate.

> Bozza concettuale: la scelta degli strumenti (container, orchestrazione, script di setup) è demandata al documento di design.
