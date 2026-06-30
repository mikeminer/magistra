---
type: Concetto
title: Ricerca normativa
description: Ricerca per concetto e per parola chiave su leggi, decreti e codici, con filtri per tipo di atto, data e vigenza.
tags: [ricerca, ricerca-semantica, retrieval]
timestamp: 2026-06-20T00:00:00Z
---

# Ricerca normativa

Permette di trovare norme e singole [unità](../modello-dati/unita.md) (articoli, commi) sul corpus, anche senza conoscere le parole esatte del testo.

## Modalità

- **[Ricerca semantica](../glossario/ricerca-semantica.md)**: per concetto, basata sugli [embedding](../glossario/embedding.md) dei [chunk](../modello-dati/chunk.md).
- **Per parola chiave**: ricerca lessicale classica, utile per termini e numeri di articolo esatti.
- **Ibrida**: combinazione delle due, con [reranking](../glossario/reranking.md) dei risultati.

## Ricerca per fattispecie

L'obiettivo non è cercare per **norma**, ma per **[fattispecie](../glossario/fattispecie.md)**: l'utente descrive un fatto concreto (es. "truffa online con bonifico e restituzione parziale") e ottiene le norme e la [giurisprudenza](../fonti/giurisprudenza.md) pertinenti — non solo l'articolo di legge il cui numero conosceva già.

È il **test reale** del retrieval: ricondurre la fattispecie concreta a quelle astratte applicabili. Si appoggia alla [pianificazione delle query](../architettura/pianificazione-query.md), che dalla descrizione dei fatti deriva le query mirate, e alimenta il [ragionamento strategico](./ragionamento-strategico.md). La capacità è misurata dalla [valutazione della qualità](../requisiti/valutazione-qualita.md).

## Pianificazione delle query

Anche nella ricerca diretta la query dell'utente non viene embeddata grezza: passa per la stessa [pianificazione delle query](../architettura/pianificazione-query.md) agentica usata dall'[assistente](./assistente-legale.md). Il sistema **riformula** la richiesta in una o più query di ricerca mirate (sinonimi, terminologia giuridica, sotto-ricerche), le embedda e ne unisce i risultati con [reranking](../glossario/reranking.md).

Vale per la modalità semantica e ibrida; la ricerca per sola parola chiave resta letterale.

## Filtri

- Tipo di atto (legge, decreto legislativo, codice…).
- Data dell'atto e **data di [vigenza](../glossario/vigenza.md)** (cosa era in vigore a una certa data — vedi [multivigenza](../glossario/multivigenza.md)).
- Fonte ([Normattiva](../fonti/normattiva.md), [EUR-Lex](../fonti/eur-lex.md), …).

Ogni risultato riporta i metadati necessari alla [citazione verificabile](../glossario/citazione-verificabile.md) e linka al testo ufficiale.
Attinge all'[indice normativo](../architettura/indice-normativo.md).
