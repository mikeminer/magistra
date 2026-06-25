---
type: Concetto
title: Calcolo di pene e termini
description: Calcolo esatto e regolato di pene e termini processuali (continuazione, prescrizione, impugnazioni), con la base normativa citata e senza affidarlo alla generazione dell'LLM.
tags: [calcolo-pena, termini, penale, affidabilita]
timestamp: 2026-06-25T00:00:00Z
---

# Calcolo di pene e termini

Capacità di calcolare in modo **esatto** pene e termini processuali, building block del [ragionamento strategico](/funzionalita/ragionamento-strategico.md). Sono numeri da cui dipendono scelte difensive: devono essere **corretti e verificabili**, non stime.

> Bozza concettuale: l'insieme delle regole coperte e i loro limiti saranno definiti nelle specifiche.

## Cosa calcola

- **Pena**: aumenti e diminuzioni, circostanze, **continuazione ex art. 81 c.p.**, computo del cumulo.
- **Prescrizione**: termini e loro decorrenza/sospensioni/interruzioni.
- **Termini processuali**: termini per impugnazione, opposizione e per gli adempimenti di fase, con le relative decorrenze.

## Principio: calcolo regolato, non generato

Il calcolo è **deterministico e basato su regole**, non prodotto dalla generazione dell'[LLM](/architettura/provider-llm.md): l'assistente orchestra e spiega il risultato, ma i numeri provengono da una logica di calcolo legata alla norma applicabile. Ogni risultato riporta la **base normativa** ([citazione verificabile](/glossario/citazione-verificabile.md)) e i passaggi del calcolo.

Questo evita le [allucinazioni](/glossario/allucinazione.md) proprio dove sarebbero più pericolose — su date, termini e quantificazioni — e mantiene la [groundedness](/glossario/groundedness.md) del prodotto.

## Relazioni

- Alimenta il [ragionamento strategico](/funzionalita/ragionamento-strategico.md): le conseguenze degli scenari poggiano su questi calcoli.
- Usa i metadati di [vigenza](/glossario/vigenza.md) per applicare la disciplina corretta nel tempo.
