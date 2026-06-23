---
type: Componente
title: Database applicativo
description: Database relazionale che conserva progetti, documenti, conversazioni, workflow e indice normativo nel runtime scelto.
tags: [database, postgresql, pglite, modello-app]
timestamp: 2026-06-20T00:00:00Z
---

# Database applicativo

Conserva i **dati dell'applicazione**: [progetti](/modello-dati/progetto.md), [documenti](/modello-dati/documento.md) caricati, [conversazioni](/modello-dati/conversazione.md), [messaggi](/modello-dati/messaggio.md), [chiavi API](/modello-dati/chiave-api.md) e [workflow](/funzionalita/workflow.md).

È **distinto concettualmente** dall'[indice normativo](/architettura/indice-normativo.md), che contiene il corpus pubblico e i suoi embedding. Nel prodotto possono però condividere lo stesso database runtime.

## Caratteristiche

- Relazionale, con adapter runtime:
  - **PostgreSQL + pgvector** quando esiste `DATABASE_URL` (managed, self-hosted, ambienti server).
  - **PGlite** quando `MAGISTRA_DB_DRIVER=pglite` e `PGLITE_DATA_DIR` sono configurati (desktop app OSS).
- Schema descritto nel [modello applicativo](/modello-dati/modello-applicativo.md).
- Soggetto ai requisiti di [sicurezza](/requisiti/sicurezza.md) (segreti cifrati) e [privacy](/requisiti/privacy-e-dati-personali.md).
- Migrazioni versionate per l'evoluzione dello schema (vedi [deployment](/architettura/deployment.md)).

## Regola di portabilita'

Il codice applicativo non deve assumere che il database sia sempre PostgreSQL. Le query passano dalla factory runtime:

- Postgres mantiene la ricerca vettoriale via `pgvector`.
- PGlite salva gli embedding in forma testuale e calcola la similarita' nel runtime TypeScript.
- Le fonti recuperate online vengono persistite nello stesso runtime DB prima di generare la risposta LLM.
