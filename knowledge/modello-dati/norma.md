---
type: Entità Dati
title: Norma (Work)
description: Entità che rappresenta la norma in astratto, indipendente dalle versioni; mappa il livello Work di FRBR.
tags: [entita, work, eli]
timestamp: 2026-06-18T00:00:00Z
---

# Norma (Work)

Astratta dai formati di origine, indipendente dal database scelto. Corrisponde al livello **Work** del [modello FRBR](/modello-dati/frbr.md).

| Campo | Descrizione |
|---|---|
| `eli` | URI [ELI](/glossario/eli.md) (chiave primaria) |
| `tipo_atto` | legge, decreto legge, d.lgs., codice, … |
| `numero` | numero dell'atto |
| `data` | data dell'atto |
| `titolo` | titolo / oggetto |
| `fonte` | provenienza (es. [Normattiva](/fonti/normattiva.md)) |

Una Norma ha una o più [Versioni](/modello-dati/versione.md).
