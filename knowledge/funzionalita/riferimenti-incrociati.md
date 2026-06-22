---
type: Concetto
title: Riferimenti incrociati
description: Collegamenti automatici tra norme citate, codici e normativa UE collegata, navigabili a partire da qualsiasi articolo.
tags: [riferimenti, cross-reference, navigazione]
timestamp: 2026-06-20T00:00:00Z
---

# Riferimenti incrociati

Da un articolo l'utente può seguire i **rinvii** ad altre norme, in entrambe le direzioni: cosa cita questo articolo e chi lo cita.

## Cosa fa

- Risolve i rinvii interni ed esterni in [riferimenti](/modello-dati/riferimento.md) navigabili (link diretti all'unità di destinazione).
- Collega la normativa nazionale al diritto UE corrispondente (vedi [recepimento](/glossario/recepimento.md) ed [EUR-Lex](/fonti/eur-lex.md)).
- Mostra i riferimenti **entranti** (le norme che citano quella corrente).

## Aspetti tecnici

- Si basa sull'estrazione dei riferimenti nella [pipeline di trasformazione](/modello-dati/pipeline-trasformazione.md) e sul grafo delle norme.
- I rinvii sono datati per restare coerenti con la [multivigenza](/glossario/multivigenza.md): un rinvio punta alla [versione](/modello-dati/versione.md) corretta.
