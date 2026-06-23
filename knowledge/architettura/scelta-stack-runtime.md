---
type: Concetto
title: Scelta stack e runtime
description: Decisione architetturale su TypeScript-first, runtime separati, desktop app e corpus pre-ingestato.
tags: [architettura, typescript, desktop, ingest, oss]
timestamp: 2026-06-23T00:00:00Z
---

# Scelta stack e runtime

Magistra OSS adotta uno stack applicativo **TypeScript-first**. La scelta nasce prima di tutto dal contesto open source: JavaScript/TypeScript è familiare a una platea molto ampia di contributor e riduce la barriera di ingresso per chi vuole contribuire a UI, API, worker, tooling e futura app desktop.

Non è una scelta ideologica contro altri runtime. Se emergerà un requisito concreto che rende Python, Rust o un altro ambiente nettamente più adatto per un componente specifico, quel componente potrà essere introdotto con un confine chiaro. Il default resta TypeScript perché oggi il prodotto richiede soprattutto retrieval, orchestrazione, indicizzazione, chat, integrazioni, frontend e distribuzione desktop.

## Perché TypeScript-first

- **Accessibilità OSS**: più contributor potenziali si sentono a proprio agio con lo stack JS/TS.
- **Coerenza di prodotto**: frontend, API, worker e desktop app possono condividere tipi, contratti e tooling.
- **Distribuzione desktop**: una futura app Windows/macOS/Linux basata su Electron può riusare gran parte dello stack applicativo.
- **Percorso managed**: TypeScript semplifica l'accesso futuro a edge functions, serverless, BFF leggeri e deployment web moderni.
- **Meno contesto mentale**: un contributor può attraversare più parti del prodotto senza cambiare linguaggio a ogni livello.

## Confini runtime

La scelta TypeScript-first non implica un unico processo. Magistra deve restare un monolite logico semplice da capire, ma con processi separati dove serve isolamento.

- **Frontend**: interfaccia React/Next.js, usata sia nel browser sia dentro la shell desktop.
- **API / RAG runtime**: richieste realtime, orchestrazione del retrieval, costruzione del contesto, chiamate LLM e gestione dei documenti utente.
- **Worker / job runtime**: import normativo, recupero online incrementale, aggiornamenti del corpus, chunking, embedding, reindicizzazione e job lunghi.
- **PostgreSQL + pgvector**: source of truth per corpus normativo, metadati, chunk e ricerca vettoriale.
- **Object storage opzionale**: documenti caricati dall'utente e allegati pesanti.

Questa separazione non è una scelta di microservizi. È una regola di affidabilità: il processo che risponde alla chat non deve condividere memoria, event loop e ciclo di vita con un ingest pesante o con un file AKN malformato.

## Regola anti-bottleneck

L'API non esegue ingest completo, parsing pesante, import online o reindicizzazione estesa nel processo che serve le richieste utente. Può pianificare, invocare, accodare e osservare job, ma il lavoro batch vive nel worker.

Questo vale indipendentemente dal linguaggio: un monolite Node o Python con chat e ingest nello stesso processo avrebbe lo stesso rischio. Il requisito reale è separare il runtime realtime dal runtime batch.

## Corpus e desktop app

L'utente finale non dovrebbe installare Magistra e re-ingestare tutto il corpus normativo italiano sul proprio device. Il corpus principale viene preparato dai maintainer come parte della pipeline di release e distribuito come database già popolato o snapshot verificabile.

La desktop app diventa quindi un bundle di prodotto, non un semplice client:

- include UI e runtime locale;
- usa un database locale inizializzato da un corpus pre-ingestato;
- può applicare aggiornamenti del corpus;
- può importare fonti online mancanti in modo incrementale;
- genera risposte solo dopo aver recuperato fonti citabili dal database locale o da fonti online importate e persistite.

Il recupero online a runtime è una funzione di completamento, non il modo ordinario per costruire tutto il corpus. Se il database locale non contiene fonti utili, il sistema cerca fonti online, le importa, ripete il retrieval sul database e solo dopo chiede all'LLM di produrre il sunto con citazioni.

## Supply chain

I rischi supply-chain esistono sia su npm sia su PyPI. La mitigazione è disciplina di progetto, non cambio di linguaggio:

- lockfile versionati;
- dipendenze minime e motivate;
- audit periodici;
- pinning delle versioni critiche;
- script di installazione e build documentati;
- confini chiari per componenti che eseguono codice o parsing non fidato.

## Quando introdurre un altro runtime

Un runtime diverso da TypeScript è accettabile quando risolve un requisito concreto e circoscritto, per esempio:

- fine-tuning o serving di modelli proprietari;
- OCR o ML locale con librerie mature disponibili solo altrove;
- parser o validatori normativi con qualità nettamente superiore in un ecosistema specifico;
- componenti CPU-bound dove un worker isolato in Rust, Python o altro riduce davvero rischio o complessità.

In quel caso il componente deve avere contratti espliciti, test e confini operativi chiari, senza trasformare il progetto in una somma di stack scollegati.

## Decisioni ancora aperte

- Formato di distribuzione del database pre-ingestato per la desktop app.
- Canale di aggiornamento del corpus e strategia di firma/verifica degli snapshot.
- Packaging locale di PostgreSQL/pgvector nella versione desktop.
- Separazione fisica dei package TS: stesso package con entrypoint diversi o workspace distinti per frontend, API e worker.
