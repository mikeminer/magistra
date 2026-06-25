---
type: Componente
title: Gestione delle API key
description: Configurazione e conservazione cifrata in locale delle chiavi dei provider LLM, senza lock-in.
tags: [api-key, cifratura, provider-llm]
timestamp: 2026-06-25T00:00:00Z
---

# Gestione delle API key

Permette di configurare in locale le chiavi per i [provider LLM](/architettura/provider-llm.md): nessun abbonamento e nessun lock-in, l'utente porta la propria chiave.

## Responsabilità

- Inserimento e aggiornamento delle [chiavi API](/modello-dati/chiave-api.md) per provider (Anthropic, Google, OpenAI o endpoint locali).
- **Conservazione [cifrata](/glossario/cifratura.md)** a riposo: mai in chiaro nel database né nei log (requisito di [sicurezza](/requisiti/sicurezza.md)).
- Selezione del modello attivo (model picker).
- Le chiavi restano sulla macchina locale dell'utente (single-utente).

## Relazioni

- Le chiavi sono usate dal [backend](/architettura/backend-api.md) al momento di interrogare l'LLM nel [flusso RAG](/architettura/flusso-rag.md).
- Modellate dall'entità [Chiave API](/modello-dati/chiave-api.md).
