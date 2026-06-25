---
type: Componente
title: Provider Iurexa
description: Integrazione LLM locale per usare Iurexa come cervello generativo del RAG di Magistra.
tags: [llm, provider, iurexa, rag]
timestamp: 2026-06-25T00:00:00Z
---

# Provider Iurexa

Iurexa è il provider LLM locale pensato per far girare la generazione di Magistra su runtime self-hosted e CPU-only. Non sostituisce il [RAG](/glossario/rag.md) di Magistra: Magistra continua a recuperare i chunk, costruire il contesto citabile e governare le fonti; Iurexa riceve solo il prompt grounded e produce la risposta in italiano con citazioni `[F1]`, `[F2]`, ecc.

## Configurazione

Per attivarlo nel runtime API:

```bash
MAGISTRA_LLM_PROVIDER=iurexa
MAGISTRA_IUREXA_BASE_URL=http://127.0.0.1:4141/v1
MAGISTRA_IUREXA_MODEL=iurexa
```

Il provider usa l'endpoint OpenAI-compatible `/chat/completions`. Le variabili `MAGISTRA_LLM_MAX_OUTPUT_TOKENS`, `MAGISTRA_LLM_TEMPERATURE`, `MAGISTRA_IUREXA_MAX_OUTPUT_TOKENS` e `MAGISTRA_IUREXA_TEMPERATURE` permettono di controllare lunghezza e campionamento.

## Contratto

- Magistra recupera le fonti e costruisce il prompt citazionale.
- Iurexa risponde solo usando le fonti fornite.
- Il backend rimuove citazioni inventate e attiva il fallback controllato se il provider locale non risponde.
- La risposta finale resta tracciabile: testo, fonti recuperate, citazioni e metriche rimangono nel formato API di Magistra.

Vedi anche [Provider LLM](/architettura/provider-llm.md), [Backend / API](/architettura/backend-api.md) e [Flusso di una domanda](/architettura/flusso-rag.md).
