---
type: Processo
title: Deployment
description: Magistra è distribuita come app desktop installabile che gira interamente in locale, senza Docker né competenze sistemistiche.
tags: [deployment, desktop, locale]
timestamp: 2026-06-25T00:00:00Z
---

# Deployment

Magistra è distribuita come **app desktop installabile**, non come stack di servizi. Il target è l'avvocato, che non deve installare Docker né gestire infrastruttura: scarica l'app e la usa.

> Bozza concettuale: la scelta puntuale degli strumenti (framework desktop, packaging, script di setup) è demandata al documento di design.

## App desktop

- È un **bundle che contiene tutto**: UI, logica di business e dati. Non un semplice client.
- Il [database](/architettura/database-applicativo.md) e l'[indice normativo](/architettura/indice-normativo.md) sono un'istanza **embedded** (PGlite, Postgres in WASM con `pgvector`); i documenti dell'utente vanno sul **filesystem locale** (vedi [archiviazione locale](/architettura/archiviazione-documenti.md)).
- I dati restano sulla macchina dell'utente, senza il costo tecnico di gestire server o servizi.
- Strumento candidato per il packaging: **Electron**, coerente con lo [stack TypeScript-first](/architettura/stack-tecnologico.md) (l'intero bundle resta in TS).

## Indice già pronto

L'[ingest del corpus](/modello-dati/pipeline-trasformazione.md) non viene eseguito sul dispositivo di ogni utente: è il team a svolgerlo in un **ambiente controllato** e a distribuire un **indice già "ingestato"**. L'indice pre-costruito è incluso nel bundle (o scaricato al primo avvio) e può essere **aggiornato**; l'utente "pro" resta libero di rieseguire l'ingest da sé, perché la relativa logica vive nel repository.

## Configurazione

- Chiavi di [cifratura](/glossario/cifratura.md) dei segreti (vedi [sicurezza](/requisiti/sicurezza.md)).
- [API key](/architettura/gestione-api-key.md) dei [provider LLM](/architettura/provider-llm.md).

I segreti non sono versionati. Lo schema del database evolve con migrazioni versionate.
