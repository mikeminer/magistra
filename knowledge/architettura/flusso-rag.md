---
type: Processo
title: Flusso di una domanda (RAG agentico)
description: Sequenza dal quesito dell'utente alla risposta con citazioni verificabili, con uno step agentico di pianificazione delle query prima del retrieval.
tags: [rag, retrieval, agentico, citazioni]
timestamp: 2026-06-25T00:00:00Z
---

# Flusso di una domanda (RAG agentico)

L'assistente non embedda la domanda così com'è: prima **ragiona** sulla richiesta e ne deriva una o più query di ricerca mirate. È un flusso [RAG agentico](/glossario/rag-agentico.md).

1. L'utente pone una domanda in linguaggio naturale.
2. **Pianificazione delle query**: l'[LLM](/architettura/provider-llm.md) analizza la richiesta e produce una o più [query di ricerca](/architettura/pianificazione-query.md) sensate (riformulazioni, terminologia giuridica, sotto-domande), invece di usare il testo grezzo della domanda.
3. Ogni query viene **embeddata** ([embedding](/glossario/embedding.md)) e usata per recuperare i [Chunk](/modello-dati/chunk.md) più rilevanti dall'[indice](/architettura/indice-normativo.md) ([ricerca semantica](/glossario/ricerca-semantica.md) + filtri di [vigenza](/glossario/vigenza.md)).
4. I risultati delle varie query vengono **uniti, deduplicati e [rerankati](/glossario/reranking.md)**.
5. Il [backend](/architettura/backend-api.md) costruisce un contesto con i testi normativi e i relativi metadati di citazione.
6. Se il contesto è insufficiente, l'assistente può **iterare**: generare nuove query e tornare al passo 3.
7. **Recupero online incrementale (fallback)**: se l'[indice](/architettura/indice-normativo.md) locale non produce risultati utili, l'API può recuperare la fonte online **esclusivamente dalle [fonti supportate](/fonti/index.md)** — fonti decise a priori e di cui conosciamo la qualità dei dati (es. [Normattiva](/fonti/normattiva.md), [EUR-Lex](/fonti/eur-lex.md)) — **importarla e persisterla** nell'indice, quindi ripetere il retrieval locale. Non si effettuano ricerche generiche sul web: si attinge solo alle fonti ufficiali integrate. Si risponde solo da fonti recuperate dall'indice, **mai direttamente** da risultati non importati o non persistiti.
8. L'LLM genera la risposta come **sunto delle fonti recuperate**, **citando** articolo, comma e fonte ([ELI](/glossario/eli.md)).
9. Il [frontend](/architettura/frontend.md) mostra la risposta con i link verificabili alle fonti.

```mermaid
flowchart TD
    Q(["Domanda dell'utente"])
    Plan["Pianificazione query<br/>(ragionamento dell'LLM)"]
    Emb["Embedding delle query"]
    Ret["Retrieval dall'indice<br/>(ricerca semantica + filtri)"]
    Online["Recupero online<br/>solo fonti supportate<br/>import + persistenza"]
    Merge["Unione · dedup · reranking"]
    Ctx["Costruzione del contesto"]
    Gen["Generazione risposta<br/>(sunto + citazioni)"]
    A(["Risposta + citazioni"])

    Q --> Plan
    Plan -->|una o più query| Emb
    Emb --> Ret
    Ret -->|nessun risultato utile| Online
    Online -->|fonte importata| Ret
    Ret --> Merge
    Merge --> Ctx
    Ctx -->|contesto insufficiente| Plan
    Ctx --> Gen
    Gen --> A
```

Vedi [RAG](/glossario/rag.md), [pianificazione delle query](/architettura/pianificazione-query.md) e [citazione verificabile](/glossario/citazione-verificabile.md).
