---
type: Concetto
title: Analisi di documenti
description: Caricamento di contratti, atti e PDF per ottenere riassunti, individuazione di clausole e verifica dei riferimenti normativi citati.
tags: [documenti, analisi, clausole]
timestamp: 2026-06-20T00:00:00Z
---

# Analisi di documenti

L'utente carica un proprio [documento](/modello-dati/documento.md) (contratto, atto, parere, PDF) e l'assistente lo analizza nel contesto del corpus normativo.

## Cosa produce

- **Riassunto** strutturato del documento.
- **Individuazione di clausole** rilevanti o critiche.
- **Verifica dei riferimenti normativi** citati nel documento: l'assistente controlla che gli articoli richiamati esistano e ne riporta il [testo vigente](/glossario/testo-vigente.md), segnalando eventuali [abrogazioni](/glossario/abrogazione.md).
- Risposte a domande mirate sul documento.

## Trattamento del file

- Il file caricato passa per la [conversione documenti](/architettura/conversione-documenti.md) (estrazione del testo, eventuale DOC/DOCX → PDF) ed è conservato nell'[object storage](/architettura/object-storage.md).
- Resta nell'ambito dell'utente / dell'istanza self-hosted (vedi [privacy](/requisiti/privacy-e-dati-personali.md)).

Si appoggia all'[assistente legale](/funzionalita/assistente-legale.md) e può essere svolta su più file insieme con le [operazioni multi-documento](/funzionalita/operazioni-multi-documento.md).
