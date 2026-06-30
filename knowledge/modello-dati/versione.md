---
type: Entità Dati
title: Versione (Expression)
description: Entità che rappresenta una versione specifica di una norma nel tempo; mappa il livello Expression di FRBR.
tags: [entita, expression, vigenza]
timestamp: 2026-06-18T00:00:00Z
---

# Versione (Expression)

Corrisponde al livello **Expression** del [modello FRBR](./frbr.md): una versione specifica di una [Norma](./norma.md) nel tempo.

| Campo | Descrizione |
|---|---|
| `id` | identificativo versione |
| `eli` | riferimento alla [Norma](./norma.md) |
| `vigenza_da` / `vigenza_a` | intervallo di [vigenza](../glossario/vigenza.md) |
| `stato` | vigente / abrogata / originaria |

Una Versione contiene molte [Unità](./unita.md).
