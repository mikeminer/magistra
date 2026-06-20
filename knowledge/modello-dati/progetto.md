---
type: Entità Dati
title: Progetto
description: Spazio di lavoro che raggruppa i documenti e le conversazioni dell'utente attorno a una pratica.
tags: [entita, progetto, modello-app]
timestamp: 2026-06-20T00:00:00Z
---

# Progetto

Raggruppa il lavoro attorno a una pratica o a un cliente. È il dato dietro la funzionalità [Progetti](/funzionalita/progetti.md).

| Campo | Descrizione |
|---|---|
| `id` | identificativo (chiave primaria) |
| `nome` | nome del progetto |
| `creato_il` | data di creazione |

## Relazioni

- Contiene [Documenti](/modello-dati/documento.md) e [Conversazioni](/modello-dati/conversazione.md).

> Versione single-utente: il progetto non ha proprietario né membri e non è condiviso. La multi-utenza è prevista solo per la futura versione cloud gestita.

Parte del [modello dati applicativo](/modello-dati/modello-applicativo.md).
