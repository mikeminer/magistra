---
type: Componente
title: Provider LLM (configurabile)
description: Almeno un provider LLM a scelta; obiettivo di lungo periodo è il supporto a modelli locali/self-hosted.
tags: [llm, provider, self-hosting]
timestamp: 2026-06-18T00:00:00Z
---

# Provider LLM (configurabile)

Almeno un provider a scelta; obiettivo di lungo periodo: supportare modelli locali/[self-hosted](/glossario/self-hosting.md) per privacy e sovranità dei dati. Il provider genera le risposte nel [flusso RAG](/architettura/flusso-rag.md).

Il runtime supporta provider remoti/OpenAI-compatible e il provider locale [Iurexa](/architettura/provider-iurexa.md). Con `MAGISTRA_LLM_PROVIDER=iurexa`, Magistra mantiene retrieval, chunking, citazioni e controllo delle fonti, mentre Iurexa diventa il motore generativo locale chiamato dall'endpoint `/ask`.

## Variabili principali

- `MAGISTRA_LLM_PROVIDER`: `stub`, `openai`, `openai-compatible`, `ollama` o `iurexa`.
- `MAGISTRA_LLM_BASE_URL` / `MAGISTRA_LLM_MODEL`: override generici per provider compatibili.
- `MAGISTRA_IUREXA_BASE_URL` / `MAGISTRA_IUREXA_MODEL`: override specifici per Iurexa.
- `MAGISTRA_LLM_MAX_OUTPUT_TOKENS` / `MAGISTRA_LLM_TEMPERATURE`: limiti e campionamento della generazione.
