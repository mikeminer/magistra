---
type: Componente
title: Database applicativo
description: Database relazionale che conserva progetti, documenti, conversazioni e workflow, distinto dall'indice vettoriale del corpus normativo.
tags: [database, postgresql, modello-app]
timestamp: 2026-06-20T00:00:00Z
---

# Database applicativo

Conserva i **dati dell'applicazione**: [progetti](/modello-dati/progetto.md), [documenti](/modello-dati/documento.md) caricati, [conversazioni](/modello-dati/conversazione.md), [messaggi](/modello-dati/messaggio.md), [chiavi API](/modello-dati/chiave-api.md) e [workflow](/funzionalita/workflow.md).

È **distinto concettualmente** dall'[indice normativo](/architettura/indice-normativo.md), che contiene il corpus pubblico e i suoi embedding. Possono però condividere la stessa istanza PostgreSQL.

## Caratteristiche

- Relazionale (proposta: **PostgreSQL**, coerente con l'uso di `pgvector` per l'indice).
- Schema descritto nel [modello applicativo](/modello-dati/modello-applicativo.md).
- Soggetto ai requisiti di [sicurezza](/requisiti/sicurezza.md) (segreti cifrati) e [privacy](/requisiti/privacy-e-dati-personali.md).
- Migrazioni versionate per l'evoluzione dello schema (vedi [deployment](/architettura/deployment.md)).
