---
type: Concetto
title: Progetti
description: Raccolte di documenti e conversazioni che fanno da contesto di lavoro per l'assistente.
tags: [progetti, vault, organizzazione]
timestamp: 2026-06-20T00:00:00Z
---

# Progetti

Un **progetto** è uno spazio di lavoro che raggruppa [documenti](/modello-dati/documento.md), [conversazioni](/modello-dati/conversazione.md) e [workflow](/funzionalita/workflow.md) attorno a una pratica o a un cliente, usato da una sola persona.

## Cosa offre

- **Organizzazione**: i documenti caricati vivono dentro un progetto.
- **Contesto per l'assistente**: l'[assistente legale](/funzionalita/assistente-legale.md) può usare i documenti del progetto, oltre al corpus normativo, come base delle risposte.

## Aspetti tecnici

- Modellato dall'entità [Progetto](/modello-dati/progetto.md).
- I documenti restano nell'[archiviazione locale](/architettura/archiviazione-documenti.md) sotto il controllo dell'utente (vedi [privacy](/requisiti/privacy-e-dati-personali.md)).

> Single-utente: nessuna condivisione tra account né collaborazione; i progetti non sono condivisi.
