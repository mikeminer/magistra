---
type: Concetto
title: Requisiti non funzionali
description: Vincoli di prestazioni, scalabilità, affidabilità, usabilità e portabilità che il sistema deve rispettare a prescindere dalle singole funzionalità.
tags: [requisiti, prestazioni, affidabilita]
timestamp: 2026-06-20T00:00:00Z
---

# Requisiti non funzionali

Vincoli trasversali che valgono per tutte le [funzionalità](/funzionalita/index.md).

> Bozza concettuale: le soglie numeriche sono indicative, da fissare nelle specifiche.

| Categoria | Requisito (proposta) |
|---|---|
| **Prestazioni** | Risposta dell'[assistente](/funzionalita/assistente-legale.md) percepita come interattiva; risultati di [ricerca](/funzionalita/ricerca-normativa.md) in tempi brevi. Streaming della risposta token-per-token. |
| **Scalabilità** | L'[indice normativo](/architettura/indice-normativo.md) deve reggere l'intero corpus statale; le [operazioni multi-documento](/funzionalita/operazioni-multi-documento.md) un numero ragionevole di file per lotto. |
| **Affidabilità** | Nessuna risposta normativa senza fonte; degrado controllato se un [provider LLM](/architettura/provider-llm.md) non è disponibile. |
| **Portabilità** | Deve poter girare interamente in [self-hosting](/glossario/self-hosting.md); componenti intercambiabili (LLM, storage, DB). Vedi [deployment](/architettura/deployment.md). |
| **Usabilità** | Interfaccia in italiano; citazioni sempre raggiungibili in un clic; trasparenza sulle fonti usate. |
| **Osservabilità** | Tracciabilità di quali [chunk](/modello-dati/chunk.md) hanno prodotto una risposta, a supporto della [valutazione della qualità](/requisiti/valutazione-qualita.md). |
| **Costi** | Uso della [API key](/architettura/gestione-api-key.md) dell'utente; nessun lock-in su un fornitore. |

Sicurezza e privacy hanno documenti dedicati: [Sicurezza](/requisiti/sicurezza.md) e [Privacy e dati personali](/requisiti/privacy-e-dati-personali.md).
