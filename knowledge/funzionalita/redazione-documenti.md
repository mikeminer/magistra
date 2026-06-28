---
type: Concetto
title: Redazione di documenti
description: Generazione di bozze di documenti legali a partire da istruzioni, modelli e contesto normativo, pronte per la revisione.
tags: [documenti, drafting, redazione]
timestamp: 2026-06-27T00:00:00Z
---

# Redazione di documenti

L'assistente **crea nuove bozze** (clausole, lettere, atti, memorie) a partire dalle istruzioni dell'utente, dal contesto di un [progetto](./progetti.md) e dalle fonti normative pertinenti.

## Cosa fa

- Genera un [documento](../modello-dati/documento.md) nuovo o una sezione, seguendo un [prompt](../glossario/prompt.md) o un [workflow](./workflow.md) salvato.
- Inserisce i riferimenti normativi come [citazioni verificabili](../glossario/citazione-verificabile.md).
- Produce output formattato e scaricabile (es. DOCX/PDF tramite la [conversione documenti](../architettura/conversione-documenti.md)).

## Livello di automazione

Approccio **ibrido**: la redazione combina **modelli parametrici** (che danno una struttura prevedibile) con la **generazione assistita** dei contenuti.
Così l'utente mantiene il controllo sulla forma dell'atto e, allo stesso tempo, la flessibilità di adattarne i contenuti al caso concreto.

- **Modelli e clausole**: una **libreria** di modelli e clausole riutilizzabili, fornita dal sistema e **personalizzabile** dall'utente (può salvare propri modelli e clausole ricorrenti).
- **Vincoli di citazione**: ogni riferimento normativo nella bozza è una [citazione verificabile](../glossario/citazione-verificabile.md); la redazione **non inventa** norme né clausole con valore legale non verificato (vedi [allucinazione](../glossario/allucinazione.md)).

## Rapporto con le altre funzionalità

- La bozza generata può essere rifinita con la [revisione con modifiche tracciate](./revisione-tracciata.md).

> Funzionalità di **Fase 3**, fuori dall'MVP (vedi [Ambito MVP](../requisiti/mvp.md) e [Roadmap](../requisiti/roadmap.md)): qui è fissata la **direzione di design**, mentre il dettaglio implementativo sarà definito nelle specifiche della fase.
