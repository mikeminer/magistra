---
type: Entità Dati
title: Chiave API
description: Credenziale di un provider LLM configurata a livello di istanza, conservata cifrata.
tags: [entita, api-key, cifratura]
timestamp: 2026-06-20T00:00:00Z
---

# Chiave API

La credenziale con cui la piattaforma interroga un [provider LLM](/architettura/provider-llm.md) per conto dell'utente. Gestita dal componente [gestione delle API key](/architettura/gestione-api-key.md).

| Campo | Descrizione |
|---|---|
| `id` | identificativo (chiave primaria) |
| `provider` | Anthropic, Google, OpenAI, endpoint locale, … |
| `valore_cifrato` | la chiave, conservata [cifrata](/glossario/cifratura.md) (mai in chiaro) |
| `creata_il` | data di inserimento |

## Note di sicurezza

- Il valore non compare mai in chiaro nel database né nei log (requisito di [sicurezza](/requisiti/sicurezza.md)).
- Le chiavi appartengono all'istanza [self-hostata](/glossario/self-hosting.md) single-utente.

Parte del [modello dati applicativo](/modello-dati/modello-applicativo.md).
