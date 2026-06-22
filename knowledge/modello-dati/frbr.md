---
type: Concetto
title: Il modello FRBR di Akoma Ntoso
description: I quattro livelli (Work, Expression, Manifestation, Item) con cui AKN gestisce versioni, formati e derivazioni di una norma.
tags: [frbr, akoma-ntoso, versioni]
timestamp: 2026-06-18T00:00:00Z
---

# Il modello FRBR di Akoma Ntoso

[Akoma Ntoso](/glossario/akoma-ntoso.md) adotta il modello **[FRBR](/glossario/frbr.md)** per gestire le numerose derivazioni dei testi normativi (modifiche, versioni, lingue). Quattro livelli:

| Livello | Significato | Esempio |
|---|---|---|
| **Work** | La norma in astratto, in tutte le sue versioni | "L. 241/1990" |
| **Expression** | Una versione specifica nel tempo/lingua | "L. 241/1990 vigente al 2020-01-01" |
| **Manifestation** | Una rappresentazione in un formato | il file XML AKN di quella versione |
| **Item** | La copia concreta (file) | il file scaricato e archiviato |

Questi livelli sono dichiarati nel blocco `<meta>` → `<identification>` tramite `<FRBRWork>`, `<FRBRExpression>`, `<FRBRManifestation>`, `<FRBRItem>`.

Questo modello è il motivo per cui Magistra può distinguere "il testo vigente oggi" da "il testo in vigore nel 2015". Le entità interne [Norma](/modello-dati/norma.md) e [Versione](/modello-dati/versione.md) mappano rispettivamente Work ed Expression.
