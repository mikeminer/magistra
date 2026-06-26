---
type: Componente
title: Database applicativo
description: Database relazionale che conserva progetti, documenti, conversazioni e workflow, distinto dall'indice vettoriale del corpus normativo.
tags: [database, pglite, modello-app]
timestamp: 2026-06-25T00:00:00Z
---

# Database applicativo

Conserva i **dati dell'applicazione**: [progetti](../modello-dati/progetto.md), [documenti](../modello-dati/documento.md) caricati, [conversazioni](../modello-dati/conversazione.md), [messaggi](../modello-dati/messaggio.md), [chiavi API](../modello-dati/chiave-api.md) e [workflow](../funzionalita/workflow.md).

È **distinto concettualmente** dall'[indice normativo](./indice-normativo.md), che contiene il corpus pubblico e i suoi embedding. Possono però condividere la stessa istanza.

## Caratteristiche

- Relazionale, basato sul **dialetto Postgres** (coerente con l'uso di `pgvector` per l'indice).
- Istanza **PGlite** embedded nel bundle dell'[app desktop](./deployment.md): Postgres in WASM, in-process, senza installazione né servizi esterni.
- Schema descritto nel [modello applicativo](../modello-dati/modello-applicativo.md).
- Soggetto ai requisiti di [sicurezza](../requisiti/sicurezza.md) (segreti cifrati) e [privacy](../requisiti/privacy-e-dati-personali.md).
- Migrazioni versionate per l'evoluzione dello schema (vedi [deployment](./deployment.md)).
