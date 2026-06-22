---
type: Entità Dati
title: Unità (articolo / comma)
description: Entità che rappresenta un'unità strutturale del testo (articolo, comma, lettera) con il suo percorso gerarchico.
tags: [entita, articolo, comma]
timestamp: 2026-06-18T00:00:00Z
---

# Unità (articolo / comma)

Unità strutturale del testo normativo, derivata dalla [struttura del documento AKN](/modello-dati/struttura-akn.md).

| Campo | Descrizione |
|---|---|
| `id` | identificativo unità |
| `versione_id` | riferimento alla [Versione](/modello-dati/versione.md) |
| `tipo` | articolo / [comma](/glossario/comma.md) / lettera |
| `numero` | es. "art. 3, comma 2" |
| `percorso` | path gerarchico nel documento |
| `testo` | testo pulito dell'unità |
| `eli_unita` | URI [ELI](/glossario/eli.md) a livello di articolo (se disponibile) |

Da un'Unità si generano uno o più [Chunk](/modello-dati/chunk.md).
