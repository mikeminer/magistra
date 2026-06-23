---
type: Processo
title: Valutazione della qualità
description: Come misurare l'affidabilità delle risposte dell'assistente: aderenza alle fonti, correttezza delle citazioni e assenza di allucinazioni.
tags: [valutazione, eval, qualita]
timestamp: 2026-06-20T00:00:00Z
---

# Valutazione della qualità

L'affidabilità delle risposte è il cuore del prodotto e va **misurata**, non assunta. Questo documento descrive come.

## Cosa misuriamo

- **[Groundedness](/glossario/groundedness.md)** (aderenza alle fonti): ogni affermazione è supportata dai [chunk](/modello-dati/chunk.md) recuperati?
- **Correttezza delle citazioni**: la [citazione verificabile](/glossario/citazione-verificabile.md) punta davvero al testo che sostiene l'affermazione, alla giusta data di [vigenza](/glossario/vigenza.md)?
- **Tasso di [allucinazioni](/glossario/allucinazione.md)**: quante affermazioni non sono supportate da alcuna fonte.
- **Qualità del retrieval**: i documenti pertinenti compaiono tra i risultati? (richiama il [reranking](/glossario/reranking.md)).
- **Qualità della ricerca per fattispecie**: il sistema identifica correttamente fatti rilevanti, istituti candidati e norme possibili anche senza articolo esplicito?
- **Utilità strategica**: nelle risposte di [ragionamento strategico difensivo](/funzionalita/ragionamento-strategico.md), le opzioni sono complete, ordinate, fondate su fonti e accompagnate da rischi e dati mancanti?
- **Freschezza giurisprudenziale**: quando usa [Cassazione penale](/fonti/cassazione-penale.md), segnala data, orientamento e limiti della fonte?
- **Copertura e rifiuto corretto**: l'assistente dichiara di non sapere quando il corpus non contiene la risposta.

## Come

- **Set di valutazione**: un insieme di quesiti con risposte e fonti attese, curato su materia italiana.
- **Stress test avvocati beta**: casi reali o anonimizzati da studi legali, con focus su penale, civile, lavoro, amministrativo e tributario (vedi [feedback avvocati beta](/requisiti/feedback-avvocati-beta.md)).
- Valutazione automatica (metriche di retrieval, controllo che le citazioni risolvano) e revisione umana a campione.
- Tracciabilità: registrare quali chunk hanno prodotto ogni risposta (vedi [requisiti non funzionali](/requisiti/requisiti-non-funzionali.md)).

> Bozza concettuale: il set di valutazione e le soglie di accettazione saranno definiti durante lo sviluppo.
Alimenta il miglioramento del [flusso RAG](/architettura/flusso-rag.md).
