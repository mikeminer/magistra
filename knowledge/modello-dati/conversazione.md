---
type: Entità Dati
title: Conversazione
description: Sequenza di messaggi tra l'utente e l'assistente, con il contesto e le citazioni prodotte, all'interno di un progetto.
tags: [entita, conversazione, modello-app]
timestamp: 2026-06-20T00:00:00Z
---

# Conversazione

Una sessione di dialogo tra l'utente e l'[assistente](/funzionalita/assistente-legale.md), conservata per poter riprendere il filo e tracciare le fonti usate.

| Campo | Descrizione |
|---|---|
| `id` | identificativo (chiave primaria) |
| `progetto` | [Progetto](/modello-dati/progetto.md) di contesto (se presente) |
| `titolo` | sintesi o prima domanda |
| `creata_il` | data di inizio |

## Relazioni

- Composta da [Messaggi](/modello-dati/messaggio.md) ordinati.
- Può fare riferimento ai [Documenti](/modello-dati/documento.md) del progetto e al corpus normativo.

Parte del [modello dati applicativo](/modello-dati/modello-applicativo.md).
