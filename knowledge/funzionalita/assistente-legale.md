---
type: Concetto
title: Assistente legale (chat)
description: Interfaccia conversazionale che risponde a domande di diritto italiano ancorando ogni risposta a fonti normative citabili.
tags: [assistente, chat, rag, citazioni]
timestamp: 2026-06-20T00:00:00Z
---

# Assistente legale (chat)

La funzionalità centrale della piattaforma: un'interfaccia di **chat** in cui l'utente pone domande in linguaggio naturale e riceve risposte fondate sul corpus normativo, con i riferimenti alle fonti.

È specializzato sul diritto italiano e vincolato alle [citazioni verificabili](/glossario/citazione-verificabile.md).

## Cosa fa

- È **agentico**: prima di cercare, ragiona sulla richiesta e ne deriva una o più [query di ricerca](/architettura/pianificazione-query.md) mirate, anziché embeddare la domanda grezza; se il contesto è insufficiente, itera con nuove query (vedi [RAG agentico](/glossario/rag-agentico.md)).
- Risponde a quesiti normativi recuperando i testi pertinenti tramite il [flusso RAG](/architettura/flusso-rag.md). L'[indice](/architettura/indice-normativo.md) locale è la prima fonte; se non basta, può attivare un **recupero online incrementale** limitato alle [fonti supportate](/fonti/index.md) (non ricerche web generiche), importando e persistendo la fonte prima di rispondere.
- **Cita** sempre articolo, [comma](/glossario/comma.md), atto e [URI ELI](/modello-dati/uri-eli.md); le citazioni sono mostrate in un pannello accanto alla risposta e linkano al testo ufficiale.
- Mantiene il contesto della [conversazione](/modello-dati/conversazione.md) (domande di follow-up).
- Può operare **dentro un [progetto](/funzionalita/progetti.md)**, usando come contesto i documenti caricati dall'utente oltre al corpus normativo.
- Può eseguire azioni sui documenti: [analizzarli](/funzionalita/analisi-documenti.md), [redigerli](/funzionalita/redazione-documenti.md) o [revisionarli](/funzionalita/revisione-tracciata.md).
- Oltre a trovare la norma, può supportare il **[ragionamento strategico](/funzionalita/ragionamento-strategico.md)**: incrociare norme, [orientamenti di legittimità](/glossario/orientamento-giurisprudenziale.md) e [calcolo di pene e termini](/funzionalita/calcolo-pena-termini.md) per presentare opzioni e conseguenze sul singolo caso.

## Vincoli

- **Nessuna risposta normativa senza fonte recuperata**: se il retrieval non trova nulla di pertinente, l'assistente lo dichiara invece di rispondere a memoria (vedi [allucinazione](/glossario/allucinazione.md) e [groundedness](/glossario/groundedness.md)).
- Il modello è [configurabile](/architettura/provider-llm.md); la qualità è misurata dalla [valutazione della qualità](/requisiti/valutazione-qualita.md).
- Non fornisce consulenza legale: è uno strumento di supporto informativo.
