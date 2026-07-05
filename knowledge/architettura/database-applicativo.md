---
type: Componente
title: Database applicativo
description: Database relazionale che conserva progetti, documenti, conversazioni e workflow, distinto dall'indice vettoriale del corpus normativo.
tags: [database, pglite, modello-app]
timestamp: 2026-06-30T00:00:00Z
---

# Database applicativo

Conserva i **dati dell'applicazione**: [progetti](../modello-dati/progetto.md), [documenti](../modello-dati/documento.md) caricati, [conversazioni](../modello-dati/conversazione.md), [messaggi](../modello-dati/messaggio.md), [chiavi API](../modello-dati/chiave-api.md) e [workflow](../funzionalita/workflow.md).

È **distinto** dall'[indice normativo](./indice-normativo.md), che contiene il corpus pubblico e i suoi embedding e usa un **motore dedicato** (LanceDB), non questa istanza PGlite.

## Caratteristiche

- Relazionale, basato sul **dialetto Postgres**.
- Istanza **PGlite** embedded nel bundle dell'[app desktop](./deployment.md): Postgres in WASM, in-process, senza installazione né servizi esterni.
- L'accesso passa da uno **strato dati dedicato** (repository/interfaccia), non da chiamate sparse al motore; schema e query mirano al **Postgres standard**, così il motore concreto (oggi PGlite embedded) resta **isolato e sostituibile** con qualunque backend Postgres-compatibile. Vedi [confini dietro interfacce](./stack-tecnologico.md).
- Schema descritto nel [modello applicativo](../modello-dati/modello-applicativo.md).
- Soggetto ai requisiti di [sicurezza](../requisiti/sicurezza.md) (segreti cifrati) e [privacy](../requisiti/privacy-e-dati-personali.md).
- Migrazioni versionate per l'evoluzione dello schema (vedi [deployment](./deployment.md)).
