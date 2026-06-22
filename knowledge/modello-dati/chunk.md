---
type: Entità Dati
title: Chunk (ricerca semantica)
description: Porzione di testo indicizzata per il retrieval, con embedding e metadati di citazione.
tags: [entita, chunk, embedding, rag]
timestamp: 2026-06-18T00:00:00Z
---

# Chunk (ricerca semantica)

Porzione di testo indicizzata per il retrieval. Vedi [chunk](/glossario/chunk.md) e [ricerca semantica](/glossario/ricerca-semantica.md).

| Campo | Descrizione |
|---|---|
| `id` | identificativo chunk |
| `unita_id` | [unità](/modello-dati/unita.md) di origine |
| `testo` | porzione di testo |
| `embedding` | [vettore](/glossario/embedding.md) per la ricerca semantica |
| `metadati` | eli, articolo, comma, vigenza → per la **[citazione](/glossario/citazione-verificabile.md)** |

I Chunk sono prodotti dalla [pipeline di trasformazione](/modello-dati/pipeline-trasformazione.md) e popolano l'[indice normativo](/architettura/indice-normativo.md).
