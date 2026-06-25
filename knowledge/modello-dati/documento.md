---
type: Entità Dati
title: Documento
description: File caricato o redatto dall'utente all'interno di un progetto, con le sue versioni; distinto dalla norma del corpus pubblico.
tags: [entita, documento, modello-app]
timestamp: 2026-06-20T00:00:00Z
---

# Documento

Un file **dell'utente** (contratto, atto, parere) caricato o generato dentro un [Progetto](/modello-dati/progetto.md). Da non confondere con la [Norma](/modello-dati/norma.md), che appartiene al corpus pubblico.

| Campo | Descrizione |
|---|---|
| `id` | identificativo (chiave primaria) |
| `progetto` | [Progetto](/modello-dati/progetto.md) di appartenenza |
| `nome` | nome del file |
| `formato` | PDF, DOCX, … |
| `uri_storage` | posizione nell'[archiviazione locale](/architettura/archiviazione-documenti.md) |
| `versioni` | cronologia delle [modifiche tracciate](/glossario/modifiche-tracciate.md) |
| `caricato_il` | data di acquisizione |

## Relazioni e trattamento

- Processato dalla [conversione documenti](/architettura/conversione-documenti.md) (estrazione testo, conversione di formato).
- Usato come contesto dall'[assistente](/funzionalita/assistente-legale.md), nell'[analisi](/funzionalita/analisi-documenti.md), nella [revisione tabellare](/funzionalita/revisione-tabellare.md) e nella [redazione](/funzionalita/redazione-documenti.md).
- Contiene dati potenzialmente personali: vedi [privacy](/requisiti/privacy-e-dati-personali.md).

Parte del [modello dati applicativo](/modello-dati/modello-applicativo.md).
