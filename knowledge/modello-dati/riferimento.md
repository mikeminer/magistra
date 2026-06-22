---
type: Entità Dati
title: Riferimento (cross-reference)
description: Entità che rappresenta un collegamento tra norme/unità (rinvio, modifica, abrogazione, recepimento UE).
tags: [entita, riferimento, grafo]
timestamp: 2026-06-18T00:00:00Z
---

# Riferimento (cross-reference)

Collegamento tra norme o unità, base del grafo delle norme.

| Campo | Descrizione |
|---|---|
| `da_eli` | norma/unità citante |
| `a_eli` | norma/unità citata |
| `tipo` | rinvio, modifica, [abrogazione](/glossario/abrogazione.md), [recepimento](/glossario/recepimento.md) UE |

I Riferimenti sono estratti nell'ultima fase della [pipeline di trasformazione](/modello-dati/pipeline-trasformazione.md).
