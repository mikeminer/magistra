---
type: Fonte Dati
title: Giurisprudenza
description: Sentenze e orientamenti dei giudici (Cassazione di legittimità, Corte Costituzionale), fondamento del ragionamento strategico dove disponibili in formato aperto.
resource: https://www.cortecostituzionale.it/
tags: [giurisprudenza, sentenze, legittimita]
timestamp: 2026-06-26T00:00:00Z
---

# Giurisprudenza

Sentenze e orientamenti, dove disponibili in formato aperto:

- **Corte Costituzionale** — portale istituzionale (<https://www.cortecostituzionale.it/>) e dati aperti con endpoint SPARQL su <https://dati.cortecostituzionale.it/>. Pronunce (~20.000 dal 1956) e massime sono rilasciate con licenza **CC BY-SA 3.0**. È, in questa fase, l'unica fonte giurisprudenziale **apertamente licenziata** integrata nella piattaforma.
- **Corte di Cassazione** — giurisprudenza di **legittimità**; il CED rende pubblica la giurisprudenza recente tramite il servizio SentenzeWeb/ItalGiure (<https://www.italgiure.giustizia.it/>). Il **testo** delle sentenze è libero (art. 5 della L. 633/1941). Per l'**MVP** si parte dalla giurisprudenza disponibile in **formato aperto** sui portali della giustizia (giustizia.it, SentenzeWeb); i servizi **commerciali** (CED, DeJure) hanno condizioni restrittive e si valutano in fase **post-MVP** (es. abbonamento API), quando il modello di business lo sostiene. Il nodo delle licenze commerciali **non blocca l'MVP**. Mappatura puntuale del disponibile in aperto: [#24](https://github.com/Italian-Builders-Org/magistra/issues/24).

## Riuso

Le condizioni per fonte sono riepilogate in [licenze](/requisiti/licenze.md). In sintesi: i contenuti della Corte Costituzionale sono **CC BY-SA 3.0** (attribuzione + *share-alike* sui dati ridistribuiti); per la Cassazione l'MVP usa le fonti aperte e l'integrazione commerciale è rimandata al post-MVP.

## Perché è una fondazione, non un'aggiunta

La giurisprudenza **di legittimità** della Cassazione non è materiale accessorio: i suoi [orientamenti](/glossario/orientamento-giurisprudenziale.md) cambiano spesso e sono il **presupposto** del [ragionamento strategico](/funzionalita/ragionamento-strategico.md). Senza di essi l'assistente può recuperare norme e calcolare termini, ma non valutare la **convenienza** di una scelta difensiva. Per questo va integrata fin dalle fasi iniziali (vedi [Roadmap](/requisiti/roadmap.md)), pur con i limiti di copertura e licenza delle fonti italiane.

Vedi anche il termine [giurisprudenza](/glossario/giurisprudenza.md) nel glossario.
