---
type: Concetto
title: Ambito MVP
description: Le funzionalità minime della prima release, sufficienti a dimostrare il valore della piattaforma, e ciò che resta esplicitamente fuori.
tags: [mvp, ambito, prioritizzazione]
timestamp: 2026-06-27T00:00:00Z
---

# Ambito MVP

Definisce il **minimo prodotto utile** della prima release: abbastanza da rispondere a quesiti normativi con citazioni verificabili e da analizzare documenti, senza l'intera gamma di funzionalità avanzate.

## Criteri di inclusione

Una funzionalità entra nell'MVP se soddisfa **tutti** questi criteri:

- **Fonti disponibili e libere**: si appoggia a fonti **apertamente licenziate** e già mappate (vedi [licenze](./licenze.md) e [giurisprudenza](../fonti/giurisprudenza.md)), senza blocchi di licenza o accesso.
- **Valore centrale**: contribuisce a rispondere a quesiti normativi con **[citazioni verificabili](../glossario/citazione-verificabile.md)** o ad analizzare documenti.
- **Compatibile col modello locale**: sostenibile in un'app **single-utente** e locale, senza infrastruttura server.
- **Costo/complessità contenuti**: non richiede integrazioni commerciali né corpus non ancora disponibili.

## Dentro l'MVP (confermato)

- Ingest di un sottoinsieme del corpus da [Normattiva](../fonti/normattiva.md) e dalla [Corte Costituzionale](../fonti/giurisprudenza.md) (apertamente licenziata, CC BY-SA 3.0) tramite la [pipeline di trasformazione](../modello-dati/pipeline-trasformazione.md), eseguito sul [worker](../architettura/worker-ingest.md) e distribuito come [indice già pronto](../architettura/deployment.md).
- [Assistente legale (chat)](../funzionalita/assistente-legale.md) con [citazioni verificabili](../glossario/citazione-verificabile.md).
- [Ricerca normativa](../funzionalita/ricerca-normativa.md) semantica, per parola chiave e **per [fattispecie](../glossario/fattispecie.md)** (descrizione di un fatto → norme pertinenti).
- [Confronto versioni](../funzionalita/confronto-versioni.md): navigazione del testo vigente e delle versioni storiche ([multivigenza](../glossario/multivigenza.md) fornita da Normattiva).
- [Verifica delle citazioni giurisprudenziali](../funzionalita/verifica-citazioni-giurisprudenza.md) in versione **lookup**: Corte Costituzionale in ingest e Cassazione consultata puntualmente via SentenzeWeb (vedi [giurisprudenza](../fonti/giurisprudenza.md)).
- [Analisi di documenti](../funzionalita/analisi-documenti.md) caricati dall'utente.
- [Gestione delle API key](../architettura/gestione-api-key.md) e [provider LLM configurabile](../architettura/provider-llm.md).
- Distribuzione come **app desktop** single-utente, installabile senza Docker (vedi [deployment](../architettura/deployment.md)).

## Fuori dall'MVP (fasi successive)

**Subito dopo l'MVP (fase prioritaria)** — il cuore differenziante, che richiede l'integrazione **completa** della giurisprudenza di legittimità:

- [Giurisprudenza di legittimità](../fonti/giurisprudenza.md) (Cassazione) integrata nel corpus e suoi [orientamenti](../glossario/orientamento-giurisprudenziale.md) — nell'MVP la Cassazione è solo in *lookup*, non ingerita.
- [Ragionamento strategico](../funzionalita/ragionamento-strategico.md) e [calcolo di pene e termini](../funzionalita/calcolo-pena-termini.md).

**Fasi successive**:

- [Riferimenti incrociati](../funzionalita/riferimenti-incrociati.md) automatici tra norme, codici e diritto UE.
- [Revisione con modifiche tracciate](../funzionalita/revisione-tracciata.md) e [redazione](../funzionalita/redazione-documenti.md) avanzata.
- [Revisione tabellare](../funzionalita/revisione-tabellare.md) e [operazioni multi-documento](../funzionalita/operazioni-multi-documento.md).
- [Progetti](../funzionalita/progetti.md) e [workflow](../funzionalita/workflow.md).

L'ordine completo è nella [Roadmap](./roadmap.md).

## Definizione di "done" (MVP)

L'MVP è completo quando l'utente può, end-to-end:

- Installare l'**app desktop** senza Docker e configurare un [provider LLM](../architettura/provider-llm.md) con la propria [API key](../architettura/gestione-api-key.md).
- Porre un quesito normativo e ricevere una risposta con **[citazioni verificabili](../glossario/citazione-verificabile.md)** (norma, articolo, data di vigenza) verso il corpus ingerito ([Normattiva](../fonti/normattiva.md) + [Corte Costituzionale](../fonti/giurisprudenza.md)).
- Eseguire [ricerca normativa](../funzionalita/ricerca-normativa.md) (semantica, parola chiave, per fattispecie) e [confronto tra versioni](../funzionalita/confronto-versioni.md) vigenti e storiche.
- Caricare un [documento](../funzionalita/analisi-documenti.md) e ottenerne analisi con riferimenti verificati.
- Vedere le citazioni giurisprudenziali **verificate** (esistenza ed estremi) oppure segnalate come non verificabili, anziché date per buone.
- Superare la [valutazione della qualità](./valutazione-qualita.md) di base.

## Fuori dal prodotto (esclusi per scelta)

Magistra è **single-utente** e locale: alcune capacità sono **escluse per scelta**, non solo rinviate:

- Autenticazione, account e login.
- Multi-utenza e condivisione di progetti tra persone.
- Notifiche email transazionali (conferme, inviti).
