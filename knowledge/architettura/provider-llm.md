---
type: Componente
title: Provider LLM (configurabile)
description: Almeno un provider LLM a scelta; obiettivo di lungo periodo è il supporto a modelli eseguiti in locale.
tags: [llm, provider, locale]
timestamp: 2026-06-25T00:00:00Z
---

# Provider LLM (configurabile)

Almeno un provider a scelta; il provider genera le risposte nel [flusso RAG](./flusso-rag.md).

Poiché la [riservatezza è la leva primaria](../requisiti/privacy-e-dati-personali.md) per gli studi legali, il supporto a **modelli eseguiti in locale** è una priorità: solo così i documenti non lasciano mai la macchina. Quando l'utente sceglie un provider **remoto**, ciò che gli viene inviato esce dalla macchina: questa scelta dev'essere resa **trasparente** e può essere mitigata da un'[anonimizzazione reversibile](./anonimizzazione-reversibile.md), che sostituisce i dati sensibili con segnaposto prima dell'invio e li ripristina nella risposta.
