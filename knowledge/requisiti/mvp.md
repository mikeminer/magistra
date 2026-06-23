---
type: Concetto
title: Ambito MVP
description: Le funzionalità minime della prima release, sufficienti a dimostrare il valore della piattaforma, e ciò che resta esplicitamente fuori.
tags: [mvp, ambito, prioritizzazione, desktop]
timestamp: 2026-06-23T00:00:00Z
---

# Ambito MVP

Definisce il **minimo prodotto utile** della prima release: abbastanza da rispondere a quesiti normativi con citazioni verificabili e da analizzare documenti, senza l'intera gamma di funzionalità avanzate.

> Bozza concettuale: questa è una proposta di partenza, da confermare nelle specifiche.

## Dentro l'MVP (proposta)

- Ingest di un sottoinsieme del corpus da [Normattiva](/fonti/normattiva.md) tramite la [pipeline di trasformazione](/modello-dati/pipeline-trasformazione.md).
- Distribuzione con corpus locale già indicizzato o snapshot aggiornabile, così l'utente non deve eseguire l'ingest completo.
- [Assistente legale (chat)](/funzionalita/assistente-legale.md) con [citazioni verificabili](/glossario/citazione-verificabile.md).
- [Ricerca normativa](/funzionalita/ricerca-normativa.md) semantica e per parola chiave.
- [Ricerca per fattispecie](/funzionalita/ricerca-per-fattispecie.md) su un primo verticale penale e civile, con assunzioni esplicite.
- Primo supporto al [ragionamento strategico difensivo](/funzionalita/ragionamento-strategico.md) per casi delimitati e coperti da fonti.
- Integrazione iniziale di [Cassazione penale](/fonti/cassazione-penale.md), almeno come fonte/metadati/orientamenti verificabili se il testo integrale non è riusabile.
- [Analisi di documenti](/funzionalita/analisi-documenti.md) caricati dall'utente.
- [Gestione delle API key](/architettura/gestione-api-key.md) e [provider LLM configurabile](/architettura/provider-llm.md).
- Esecuzione **single-utente** come desktop app o self-hosted tecnico (vedi [deployment](/architettura/deployment.md)).

## Fuori dall'MVP (fasi successive)

- [Revisione tabellare](/funzionalita/revisione-tabellare.md) e [operazioni multi-documento](/funzionalita/operazioni-multi-documento.md).
- [Revisione con modifiche tracciate](/funzionalita/revisione-tracciata.md) e [redazione](/funzionalita/redazione-documenti.md) avanzata.
- [Workflow](/funzionalita/workflow.md).
- Giurisprudenza completa multi-materia e verifica avanzata delle citazioni giurisprudenziali oltre il primo verticale penale.

L'ordine completo è nella [Roadmap](/requisiti/roadmap.md).

## Fuori dal prodotto OSS (versione cloud gestita)

Non solo rinviati a una fase successiva, ma **esclusi per scelta** dalla versione open source single-utente:

- Autenticazione, account e login.
- Multi-utenza e condivisione di progetti tra persone.
- Notifiche email transazionali (conferme, inviti).

Queste capacità apparterranno alla futura **versione cloud gestita**.
