---
type: Concetto
title: Modello dati applicativo
description: Panoramica delle entità dell'applicazione (progetto, documento, conversazione, messaggio, chiave API) e delle loro relazioni, distinte dal corpus normativo.
tags: [modello-app, entita, relazioni]
timestamp: 2026-06-20T00:00:00Z
---

# Modello dati applicativo

Oltre al **corpus normativo** ([Norma](./norma.md), [Versione](./versione.md), [Unità](./unita.md), [Chunk](./chunk.md)), la piattaforma gestisce i **dati dell'applicazione**: il lavoro dell'utente sui documenti.

Queste entità vivono nel [database applicativo](../architettura/database-applicativo.md) e sono nettamente separate dal corpus pubblico.
Trattandosi di una versione **single-utente**, non esiste un'entità "utente" né alcun modello di account o condivisione.

```mermaid
flowchart TD
    P["Progetto"]
    D["Documento"]
    C["Conversazione"]
    M["Messaggio"]
    K["Chiave API<br/>(config. istanza)"]

    P -->|contiene| D
    P -->|contiene| C
    C -->|composta da| M
    M -. cita .-> D
    M -. cita .-> Corpus(["Corpus normativo<br/>(Norma / Unità / Chunk)"])
```

## Entità

- [Progetto](./progetto.md)
- [Documento](./documento.md)
- [Conversazione](./conversazione.md)
- [Messaggio](./messaggio.md)
- [Chiave API](./chiave-api.md)

> Bozza concettuale: lo schema serve a ragionare sui dati del prodotto, non è ancora un'implementazione.
