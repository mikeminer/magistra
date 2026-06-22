---
type: Concetto
title: Verifica delle citazioni giurisprudenziali
description: Controllo che una sentenza citata in una risposta o in un documento esista realmente, con i suoi estremi, e sia pertinente.
tags: [giurisprudenza, citazioni, verifica]
timestamp: 2026-06-20T00:00:00Z
---

# Verifica delle citazioni giurisprudenziali

Quando una risposta o un [documento](/modello-dati/documento.md) richiama una sentenza, la piattaforma ne verifica l'esistenza e gli estremi, per evitare riferimenti inventati.

Si applica alle citazioni della [giurisprudenza](/glossario/giurisprudenza.md) italiana, per ridurre il rischio di riferimenti a pronunce inesistenti o errate.

## Cosa fa (obiettivo)

- Riconosce gli estremi di una pronuncia (organo, sezione, numero, anno) in un testo.
- Verifica che la sentenza esista presso una fonte e ne riporta i dati essenziali.
- Segnala quando una citazione **non è verificabile**, anziché darla per buona (vedi [allucinazione](/glossario/allucinazione.md)).

## Stato e dipendenze

- Dipende dalla disponibilità di [fonti giurisprudenziali](/fonti/giurisprudenza.md) in formato aperto e interrogabile: in Italia la copertura è frammentata.
- **Bozza concettuale**: la mappatura puntuale delle fonti italiane utilizzabili e dei loro limiti di licenza è un approfondimento successivo (vedi [Roadmap](/requisiti/roadmap.md)).
