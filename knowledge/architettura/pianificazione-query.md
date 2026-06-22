---
type: Processo
title: Pianificazione delle query
description: Step agentico in cui l'LLM ragiona sulla richiesta dell'utente e genera una o più query di ricerca mirate, prima dell'embedding e del retrieval.
tags: [agentico, retrieval, query]
timestamp: 2026-06-20T00:00:00Z
---

# Pianificazione delle query

Prima di interrogare l'[indice normativo](/architettura/indice-normativo.md), la richiesta dell'utente **non** viene embeddata così com'è: viene elaborata per derivarne una o più **query di ricerca** pensate per massimizzare il recupero delle norme pertinenti. È il cuore del comportamento [agentico](/glossario/rag-agentico.md) descritto nel [flusso RAG](/architettura/flusso-rag.md).

Questo step è condiviso da due funzionalità: l'[assistente legale](/funzionalita/assistente-legale.md) (nel flusso RAG) e la [ricerca normativa](/funzionalita/ricerca-normativa.md) diretta (modalità semantica e ibrida).

## Perché

Una domanda in linguaggio naturale è spesso poco adatta come query di [ricerca semantica](/glossario/ricerca-semantica.md): può essere vaga, contenere più quesiti, o usare termini diversi da quelli del testo normativo. Embeddare la domanda grezza produce risultati deboli.

## Cosa fa l'LLM nello step di pianificazione

- **Interpreta l'intento**: materia, riferimenti espliciti (atto, articolo), ambito temporale e di [vigenza](/glossario/vigenza.md).
- **Scompone** una domanda complessa in più sotto-domande.
- **Riformula** in terminologia giuridica e con sinonimi, generando **più query** alternative.
- Decide eventuali **filtri** (tipo di atto, data di vigenza, fonte).

Ogni query prodotta viene poi [embeddata](/glossario/embedding.md) e usata per il retrieval; i risultati sono uniti, deduplicati e [rerankati](/glossario/reranking.md).

## Iterazione

Se il contesto recuperato è insufficiente, l'assistente può generare **nuove query** e ripetere il retrieval, fino a raccogliere materiale adeguato o a dichiarare che il corpus non contiene la risposta.

Le query generate sono conservate nel [Messaggio](/modello-dati/messaggio.md) per tracciabilità e [valutazione della qualità](/requisiti/valutazione-qualita.md).
