---
type: Concetto
title: Ricerca per fattispecie
description: Ricerca giuridica che parte dai fatti descritti dall'avvocato e non solo dal numero della norma.
tags: [ricerca, fattispecie, retrieval, penale, civile]
timestamp: 2026-06-23T00:00:00Z
---

# Ricerca per fattispecie

La ricerca per [fattispecie](/glossario/fattispecie.md) permette all'avvocato di descrivere uno scenario in linguaggio naturale e ottenere fonti pertinenti anche quando non cita una norma esatta.

Esempio: "truffa online con bonifico e restituzione parziale" non deve produrre solo un aggancio letterale all'art. 640 c.p.; deve recuperare norme, istituti e orientamenti collegati al fatto descritto, distinguendo ciò che è certo da ciò che richiede qualificazione professionale.

## Obiettivo

- Trasformare fatti grezzi in ipotesi giuridiche ricercabili.
- Recuperare norme, definizioni, aggravanti, cause di esclusione, termini e rimedi collegati.
- Restituire risultati pertinenti anche quando la domanda usa linguaggio operativo di studio invece di terminologia normativa.
- Rendere esplicite le assunzioni fatte dal sistema.

## Come funziona

La [pianificazione delle query](/architettura/pianificazione-query.md) deve produrre un "frame di fattispecie":

- fatti rilevanti;
- materia e possibile rito o fase;
- qualificazioni giuridiche candidate;
- norme possibili;
- parole chiave giurisprudenziali;
- elementi mancanti da chiedere all'utente.

Il retrieval interroga prima l'[indice normativo](/architettura/indice-normativo.md). Se il corpus locale non contiene fonti sufficienti, usa il recupero online incrementale, importa le fonti nel database e ripete il retrieval prima della risposta.

## Output atteso

La risposta non deve limitarsi a "ecco la norma". Deve mostrare:

- fattispecie candidate;
- fonti normative e, quando disponibili, orientamenti giurisprudenziali;
- elementi fattuali che confermano o indeboliscono ciascuna ipotesi;
- lacune informative che impediscono una conclusione affidabile;
- citazioni verificabili.

Vedi anche [ragionamento strategico difensivo](/funzionalita/ragionamento-strategico.md) e [Cassazione penale](/fonti/cassazione-penale.md).
