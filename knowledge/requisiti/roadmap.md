---
type: Concetto
title: Roadmap
description: Le fasi di sviluppo dopo la knowledge base, dall'MVP alle funzionalità avanzate sul diritto italiano.
tags: [roadmap, fasi, pianificazione]
timestamp: 2026-06-25T00:00:00Z
---

# Roadmap

Sequenza proposta di fasi, dalla knowledge base verso il prodotto. Ogni fase è cumulativa.

> Bozza concettuale, senza date: serve a ordinare il lavoro, non a impegnarsi su scadenze.

## Fase 0 — Knowledge base (attuale)

- Bundle [OKF](../index.md) completo: fonti, modello dati, architettura, funzionalità, requisiti, glossario.
- Da qui si generano il documento di **specifiche** e quello di **design**.

## Fase 1 — MVP

- Le funzionalità elencate in [Ambito MVP](./mvp.md).
- [Pipeline di ingest](../modello-dati/pipeline-trasformazione.md) su un sottoinsieme del corpus.
- [Ricerca per fattispecie](../funzionalita/ricerca-normativa.md) e [valutazione della qualità](./valutazione-qualita.md) di base.

## Fase 2 — Giurisprudenza di legittimità e ragionamento strategico

Il cuore differenziante del prodotto

- Integrazione delle [fonti giurisprudenziali](../fonti/giurisprudenza.md) di **legittimità** (Cassazione) e dei loro [orientamenti](../glossario/orientamento-giurisprudenziale.md).
- [Calcolo di pene e termini](../funzionalita/calcolo-pena-termini.md) esatto e regolato.
- [Ragionamento strategico](../funzionalita/ragionamento-strategico.md): scenari e opzioni ragionate con le loro conseguenze.
- [Verifica delle citazioni giurisprudenziali](../funzionalita/verifica-citazioni-giurisprudenza.md).

## Fase 3 — Lavoro sui documenti

- [Redazione](../funzionalita/redazione-documenti.md), [revisione con modifiche tracciate](../funzionalita/revisione-tracciata.md) e [progetti](../funzionalita/progetti.md).

## Fase 4 — Produttività avanzata

- [Revisione tabellare](../funzionalita/revisione-tabellare.md), [operazioni multi-documento](../funzionalita/operazioni-multi-documento.md), [workflow](../funzionalita/workflow.md).
