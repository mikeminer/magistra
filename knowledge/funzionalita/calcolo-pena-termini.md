---
type: Concetto
title: Calcolo di pene e termini
description: Calcolo regolato di termini processuali e limiti di pena (continuazione, prescrizione, impugnazioni), con la base normativa citata e senza affidarlo alla generazione dell'LLM.
tags: [calcolo-pena, termini, penale, affidabilita]
timestamp: 2026-06-25T00:00:00Z
---

# Calcolo di pene e termini

Capacità di calcolare in modo **affidabile** termini processuali e limiti di pena, building block del [ragionamento strategico](/funzionalita/ragionamento-strategico.md). Sono numeri da cui dipendono scelte difensive: devono essere **corretti e verificabili**, non stime generate a memoria.

> Bozza concettuale: l'insieme delle regole coperte e i loro limiti saranno definiti nelle specifiche.

## Cosa calcola: il confine deterministico/discrezionale

Va distinto ciò che è **computabile in modo esatto** da ciò che resta **discrezionale** del giudice e che lo strumento può solo inquadrare, non quantificare al posto suo:

- **Termini processuali**: termini per impugnazione, opposizione e per gli adempimenti di fase, con le relative decorrenze. Sono **deterministici** (computo dei termini, sospensione feriale, ecc.).
- **Prescrizione**: termini e loro decorrenza/sospensioni/interruzioni. In larga parte **deterministica**, una volta noti gli eventi rilevanti.
- **Pena**: **limiti edittali** (minimo/massimo), effetti aritmetici di circostanze a frazione fissa, tetti del cumulo materiale e giuridico. Sono i **confini** entro cui ragionare. Restano invece **discrezionali** — e quindi non "calcolabili" — il *quantum* in concreto, l'aumento per la **continuazione ex art. 81 c.p.** (fino al triplo), il **bilanciamento delle circostanze ex art. 69 c.p.** e l'applicazione della **recidiva facoltativa ex art. 99 c.p.**

## Principio: calcolo regolato, non generato

Dove il risultato è determinato dalle regole, il calcolo è **deterministico e basato su regole**, non prodotto dalla generazione dell'[LLM](/architettura/provider-llm.md): l'assistente orchestra e spiega il risultato, ma i numeri provengono da una logica di calcolo legata alla norma applicabile. Ogni risultato riporta la **base normativa** ([citazione verificabile](/glossario/citazione-verificabile.md)) e i passaggi del calcolo; dove la determinazione è discrezionale, lo strumento espone la **forbice** e i criteri, non un valore unico spacciato per certo.

Questo evita le [allucinazioni](/glossario/allucinazione.md) proprio dove sarebbero più pericolose — su date, termini e quantificazioni — e mantiene la [groundedness](/glossario/groundedness.md) del prodotto.

## Confine: supporto, non sostituzione

I calcoli **affiancano** il professionista e non sostituiscono la sua valutazione né l'esercizio della discrezionalità del giudice: non sono [consulenza legale](/funzionalita/assistente-legale.md) e non garantiscono esiti (vedi [ragionamento strategico](/funzionalita/ragionamento-strategico.md)).

## Relazioni

- Alimenta il [ragionamento strategico](/funzionalita/ragionamento-strategico.md): le conseguenze degli scenari poggiano su questi calcoli.
- Usa i metadati di [vigenza](/glossario/vigenza.md) per applicare la disciplina corretta nel tempo.
