---
type: Processo
title: Pipeline di trasformazione
description: Dal download AKN di Normattiva fino all'indice vettoriale e al grafo dei riferimenti, preservando i metadati di citazione.
tags: [pipeline, ingest, chunking, embedding, release]
timestamp: 2026-06-23T00:00:00Z
---

# Pipeline di trasformazione

```mermaid
flowchart TD
    N(["Normattiva (API)"])
    P["Parsing AKN<br/>estrazione struttura (Work / Expression / Unità)"]
    T["Normalizzazione testo<br/>(preservando i riferimenti)"]
    C["Chunking per unità<br/>(articolo / comma, con metadati di citazione)"]
    E["Embedding"]
    R["Estrazione riferimenti"]
    IV[("Indice vettoriale")]
    G[("Grafo delle norme")]
    S[/"Snapshot DB<br/>pre-ingestato"/]

    N -->|download AKN + metadati ELI| P
    P --> T
    T --> C
    C --> E
    E --> IV
    E --> R
    R --> G
    IV --> S
    G --> S
```

**Principio chiave**: ogni [Chunk](/modello-dati/chunk.md) porta con sé i metadati necessari a costruire una **[citazione verificabile](/glossario/citazione-verificabile.md)** ([ELI](/glossario/eli.md) + articolo + comma + data di vigenza). Senza questi metadati il chunk non entra nell'indice.

Le fasi attingono dalla fonte [Normattiva](/fonti/normattiva.md) e alimentano l'[indice normativo](/architettura/indice-normativo.md).

## Responsabilità di release

L'ingest completo del corpus è una responsabilità dei maintainer e della pipeline di release, non un'operazione da ripetere su ogni dispositivo dell'utente finale. La release può produrre uno snapshot del database già indicizzato, verificabile e aggiornabile.

Nel runtime utente restano possibili import incrementali: se il database locale non contiene una fonte necessaria, il sistema la recupera online, la importa, rigenera i chunk/embedding necessari e poi usa quei dati per il sunto LLM con citazioni.
