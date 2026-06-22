---
type: Concetto
title: Struttura del documento AKN
description: Articolazione tipica di un atto Akoma Ntoso; l'articolo come unità fondamentale e il comma come sotto-unità per le citazioni.
tags: [akoma-ntoso, struttura, articolo, comma]
timestamp: 2026-06-18T00:00:00Z
---

# Struttura del documento AKN

Un atto (`<act>`) si articola tipicamente in:

```
<akomaNtoso>
  <act>
    <meta> … identificazione FRBR, riferimenti, cicli di vita …
    <preface> … titolo, intestazione …
    <preamble> … premesse …
    <body>
      <article>          (unità di base: articolo)
        <num>            (numero articolo)
        <heading>        (rubrica)
        <paragraph>      (comma)
          <num>          (numero comma)
          <content>      (testo)
      …
    <conclusions> … formule finali …
```

L'**articolo** (`<article>`) è l'unità fondamentale; il **[comma](/glossario/comma.md)** (`<paragraph>`) è la sotto-unità più rilevante per le citazioni puntuali. Queste unità sono modellate dall'entità [Unità](/modello-dati/unita.md).
