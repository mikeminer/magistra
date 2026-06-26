---
type: Indice
title: Modello dati e parsing Akoma Ntoso
description: Come la piattaforma rappresenta una norma italiana a partire da Normattiva (Akoma Ntoso / ELI) e la trasforma in unità interrogabili.
tags: [modello-dati, akoma-ntoso, eli, rag]
timestamp: 2026-06-18T00:00:00Z
---

# Modello dati e parsing Akoma Ntoso

Questa cartella descrive come Magistra rappresenta una norma italiana a partire dai dati di Normattiva ([Akoma Ntoso](../glossario/akoma-ntoso.md) / [ELI](../glossario/eli.md)) e come la trasforma in unità interrogabili per la ricerca semantica e le citazioni.

> È una **bozza concettuale**: lo schema serve a ragionare sui dati, non è ancora un'implementazione.

## Concetti di base

- [Il modello FRBR](./frbr.md) — Work / Expression / Manifestation / Item.
- [Identificazione: URI ELI](./uri-eli.md) — chiave primaria stabile.
- [Struttura del documento AKN](./struttura-akn.md) — articolo e comma.
- [Pipeline di trasformazione](./pipeline-trasformazione.md) — da Normattiva all'indice vettoriale.

## Entità del corpus normativo

- [Norma](./norma.md) (Work)
- [Versione](./versione.md) (Expression)
- [Unità](./unita.md) (articolo / comma)
- [Chunk](./chunk.md) (ricerca semantica)
- [Riferimento](./riferimento.md) (cross-reference)

## Entità del modello applicativo

Distinte dal corpus pubblico: rappresentano il lavoro dell'utente sui documenti (vivono nel [database applicativo](../architettura/database-applicativo.md)). La versione OSS è single-utente: non c'è un'entità "utente" né account.

- [Modello dati applicativo](./modello-applicativo.md) — panoramica e relazioni.
- [Progetto](./progetto.md)
- [Documento](./documento.md) (file dell'utente)
- [Conversazione](./conversazione.md)
- [Messaggio](./messaggio.md)
- [Chiave API](./chiave-api.md)
