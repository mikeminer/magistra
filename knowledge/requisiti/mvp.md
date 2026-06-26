---
type: Concetto
title: Ambito MVP
description: Le funzionalità minime della prima release, sufficienti a dimostrare il valore della piattaforma, e ciò che resta esplicitamente fuori.
tags: [mvp, ambito, prioritizzazione]
timestamp: 2026-06-25T00:00:00Z
---

# Ambito MVP

Definisce il **minimo prodotto utile** della prima release: abbastanza da rispondere a quesiti normativi con citazioni verificabili e da analizzare documenti, senza l'intera gamma di funzionalità avanzate.

> Bozza concettuale: questa è una proposta di partenza, da confermare nelle specifiche.

## Dentro l'MVP (proposta)

- Ingest di un sottoinsieme del corpus da [Normattiva](../fonti/normattiva.md) tramite la [pipeline di trasformazione](../modello-dati/pipeline-trasformazione.md), eseguito sul [worker](../architettura/worker-ingest.md) e distribuito come [indice già pronto](../architettura/deployment.md).
- [Assistente legale (chat)](../funzionalita/assistente-legale.md) con [citazioni verificabili](../glossario/citazione-verificabile.md).
- [Ricerca normativa](../funzionalita/ricerca-normativa.md) semantica, per parola chiave e **per [fattispecie](../glossario/fattispecie.md)** (descrizione di un fatto → norme pertinenti).
- [Analisi di documenti](../funzionalita/analisi-documenti.md) caricati dall'utente.
- [Gestione delle API key](../architettura/gestione-api-key.md) e [provider LLM configurabile](../architettura/provider-llm.md).
- Distribuzione come **app desktop** single-utente, installabile senza Docker (vedi [deployment](../architettura/deployment.md)).

## Fuori dall'MVP (fasi successive)

**Subito dopo l'MVP (fase prioritaria)** — il cuore differenziante, anticipato su indicazione degli avvocati:

- [Giurisprudenza di legittimità](../fonti/giurisprudenza.md) (Cassazione) e suoi [orientamenti](../glossario/orientamento-giurisprudenziale.md).
- [Ragionamento strategico](../funzionalita/ragionamento-strategico.md) e [calcolo di pene e termini](../funzionalita/calcolo-pena-termini.md).
- [Verifica delle citazioni giurisprudenziali](../funzionalita/verifica-citazioni-giurisprudenza.md).

**Fasi successive**:

- [Revisione con modifiche tracciate](../funzionalita/revisione-tracciata.md) e [redazione](../funzionalita/redazione-documenti.md) avanzata.
- [Revisione tabellare](../funzionalita/revisione-tabellare.md) e [operazioni multi-documento](../funzionalita/operazioni-multi-documento.md).
- [Workflow](../funzionalita/workflow.md).

L'ordine completo è nella [Roadmap](./roadmap.md).

## Fuori dal prodotto (esclusi per scelta)

Magistra è **single-utente** e locale: alcune capacità sono **escluse per scelta**, non solo rinviate:

- Autenticazione, account e login.
- Multi-utenza e condivisione di progetti tra persone.
- Notifiche email transazionali (conferme, inviti).
