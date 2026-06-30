---
type: Concetto
title: Roadmap
description: Le fasi di sviluppo dopo la knowledge base, dall'MVP alle funzionalità avanzate sul diritto italiano.
tags: [roadmap, fasi, pianificazione]
timestamp: 2026-06-27T00:00:00Z
---

# Roadmap

Sequenza di fasi, dalla knowledge base verso il prodotto. Ogni fase è **cumulativa** ed è coerente con l'[Ambito MVP](./mvp.md).

> Senza date: serve a ordinare il lavoro e a chiarire le dipendenze, non a impegnarsi su scadenze.

## Fase 0 — Knowledge base (attuale)

- Bundle [OKF](../index.md) completo: fonti, modello dati, architettura, funzionalità, requisiti, glossario.
- Da qui si generano il documento di **specifiche** e quello di **design**.
- **Precede l'MVP**: è il presupposto delle fasi successive.

## Fase 1 — MVP

L'ambito confermato è in [Ambito MVP](./mvp.md). In sintesi:

- [Pipeline di ingest](../modello-dati/pipeline-trasformazione.md) su un sottoinsieme del corpus da [Normattiva](../fonti/normattiva.md) **e dalla [Corte Costituzionale](../fonti/giurisprudenza.md)** (apertamente licenziata).
- [Assistente legale](../funzionalita/assistente-legale.md) con [citazioni verificabili](../glossario/citazione-verificabile.md), [ricerca normativa](../funzionalita/ricerca-normativa.md) (anche **per fattispecie**) e [confronto versioni](../funzionalita/confronto-versioni.md).
- [Verifica delle citazioni giurisprudenziali](../funzionalita/verifica-citazioni-giurisprudenza.md) in versione **lookup** (Corte Cost. in ingest, Cassazione consultata puntualmente).
- [Analisi di documenti](../funzionalita/analisi-documenti.md) e [valutazione della qualità](./valutazione-qualita.md) di base.

## Fase 2 — Giurisprudenza di legittimità e ragionamento strategico

Il cuore differenziante del prodotto.

- Integrazione **nel corpus** delle [fonti giurisprudenziali](../fonti/giurisprudenza.md) di **legittimità** (Cassazione) e dei loro [orientamenti](../glossario/orientamento-giurisprudenziale.md): la verifica delle citazioni passa dal *lookup* alla copertura sul corpus completo.
- [Calcolo di pene e termini](../funzionalita/calcolo-pena-termini.md) esatto e regolato.
- [Ragionamento strategico](../funzionalita/ragionamento-strategico.md): scenari e opzioni ragionate con le loro conseguenze.

## Fase 3 — Navigazione avanzata e lavoro sui documenti

- [Riferimenti incrociati](../funzionalita/riferimenti-incrociati.md) automatici tra norme, codici e diritto UE.
- [Redazione](../funzionalita/redazione-documenti.md), [revisione con modifiche tracciate](../funzionalita/revisione-tracciata.md) e [progetti](../funzionalita/progetti.md).

## Fase 4 — Produttività avanzata

- [Revisione tabellare](../funzionalita/revisione-tabellare.md), [operazioni multi-documento](../funzionalita/operazioni-multi-documento.md), [workflow](../funzionalita/workflow.md).

## Dipendenze principali

- La **Fase 1** dipende dalla Fase 0 (knowledge base) e dalle fonti **apertamente licenziate** mappate in [giurisprudenza](../fonti/giurisprudenza.md) e [licenze](./licenze.md).
- La **Fase 2** dipende dall'accesso al corpus completo della Cassazione (oggi senza licenza aperta né bulk: vedi [giurisprudenza](../fonti/giurisprudenza.md)), quindi è successiva all'MVP.
- Le **Fasi 3–4** dipendono dalle capacità documentali e di ricerca consolidate nelle fasi precedenti.
