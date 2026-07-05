---
type: Processo
title: Valutazione della qualità
description: Come misurare l'affidabilità delle risposte dell'assistente: aderenza alle fonti, correttezza delle citazioni e assenza di allucinazioni.
tags: [valutazione, eval, qualita]
timestamp: 2026-06-30T00:00:00Z
---

# Valutazione della qualità

L'affidabilità delle risposte è il cuore del prodotto e va **misurata**, non assunta. Questo documento descrive come.

Il set di valutazione è un **artefatto del prodotto**, versionato nel repository e collegato alla CI: non documentazione descrittiva, ma casi riproducibili con fonti attese verificabili.
L'obiettivo dell'MVP non è "valutare tutto subito", ma **impedire regressioni** su citazioni, fonti e risposte non supportate.
Il piano è **incrementale**: parte da un nucleo essenziale e cresce nel tempo.

## Cosa misuriamo

- **[Groundedness](../glossario/groundedness.md)** (aderenza alle fonti): ogni affermazione è supportata dai [chunk](../modello-dati/chunk.md) recuperati?
- **Correttezza delle citazioni**: la [citazione verificabile](../glossario/citazione-verificabile.md) punta davvero al testo che sostiene l'affermazione, alla giusta data di [vigenza](../glossario/vigenza.md)?
- **Tasso di [allucinazioni](../glossario/allucinazione.md)**: quante affermazioni non sono supportate da alcuna fonte.
- **Qualità del retrieval**: i documenti pertinenti compaiono tra i risultati? (richiama il [reranking](../glossario/reranking.md)).
- **Retrieval per [fattispecie](../glossario/fattispecie.md)**: data la descrizione di un fatto concreto, l'assistente recupera le norme e la [giurisprudenza](../fonti/giurisprudenza.md) pertinenti — non solo l'articolo già noto. È il test reale della [ricerca per fattispecie](../funzionalita/ricerca-normativa.md).
- **Copertura e rifiuto corretto**: l'assistente dichiara di non sapere quando il corpus non contiene la risposta.

## Livelli di valutazione

Quattro set distinti, con ruoli diversi:

| Livello | Quando gira | Ruolo |
|---|---|---|
| **Smoke** | A ogni PR (bloccante) | Piccolo set che intercetta regressioni grossolane su retrieval, citazioni e rifiuto corretto. |
| **MVP** | Sulla release (report) | Set principale della prima release: vedi categorie sotto. |
| **Regression** | A ogni PR (bloccante) | Ogni bug reale o feedback diventa un caso permanente; non deve mai regredire. |
| **Review legale** | A campione (umana) | Revisione manuale di groundedness e utilità; non bloccante all'inizio. |

Le categorie di caso del set MVP: domande **normative**, **ricerca per fattispecie**, **vigenza**, **analisi documentale di base** e casi di **rifiuto** (corpus insufficiente).
La verifica di citazioni di **giurisprudenza** in MVP è limitata alla **risolvibilità della citazione** (*lookup*), coerente con l'[ambito MVP](./mvp.md); la verifica semantica più profonda vive in un set esteso non bloccante.

## Formato dei casi

Ogni caso è versionato e dichiara almeno:

| Campo | Note |
|---|---|
| `id` | Identificatore stabile. |
| `area` | Materia (es. penale, civile). |
| `tipo` | `normativa`, `fattispecie`, `vigenza`, `giurisprudenza`, `documento`, `rifiuto`. |
| `domanda` | Il quesito o la descrizione del fatto. |
| `fonti_attese` | Per ogni fonte: riferimento, URL/[ELI](../glossario/eli.md)/URN, articolo/comma se applicabile, data di [vigenza](../glossario/vigenza.md) se rilevante. |
| `criteri_accettazione` | Cosa rende accettabile la risposta. |
| `deve_rifiutare` | `true` quando la risposta non è supportabile dal corpus. |
| `note_revisione_umana` | Opzionali, per la review a campione. |

## Metriche minime

- **Citation resolvability**: ogni citazione prodotta risolve a una fonte esistente.
- **Expected source recall@k**: le fonti attese compaiono tra i primi risultati recuperati.
- **Citation coverage**: le affermazioni giuridiche sostanziali sono coperte da citazioni.
- **Groundedness**: la risposta deriva dai chunk/fonti recuperati, non da conoscenza libera del modello.
- **Tasso di allucinazione**: nessuna affermazione normativa specifica senza fonte.
- **Refusal correctness**: quando il corpus non supporta la risposta, l'assistente lo dichiara.
- **Vigenza correctness**: quando una norma cambia nel tempo, la risposta usa la versione corretta o dichiara il limite.
- **Regression pass rate**: i casi già corretti non si rompono.

## Soglie iniziali

Valori **indicativi** per la prima CI dell'MVP, da confermare e irrigidire in fase di implementazione:

| Metrica | Soglia iniziale |
|---|---|
| Citazioni valide e risolvibili | `100%` |
| Regression già accettate che continuano a passare | `100%` |
| Expected source recall@5 (set MVP) | `>= 90%` |
| Risposte accettabili sui casi normativi espliciti | `>= 80%` |
| Rifiuto corretto nei casi senza fonti sufficienti | `>= 90%` |
| Allucinazioni critiche (norme/articoli inventati, citazioni false) | `0` |
| Affermazioni giuridiche minori non supportate (casi campionati) | `<= 5%` |

Le soglie restano **esplicite fin da ora**: possono salire dopo l'MVP, ma non sono lasciate implicite.

## Integrazione in CI

Due livelli:

- **Bloccante su PR**: validazione dello schema dei casi, *smoke eval*, *regression eval*, controllo citazioni risolvibili.
- **Report non bloccante**: *eval* MVP completa, groundedness con revisione manuale o *judge* assistito, andamento storico delle metriche.

Quando le metriche del report saranno stabili, l'*eval* MVP potrà diventare bloccante.

## Regola di regressione

Ogni bug reale, feedback beta o risposta sbagliata diventa un **caso permanente** nel set di regression.
Il set cresce nel tempo e non deve regredire: è il meccanismo che trasforma la qualità da promessa generica a **contratto misurabile**.

> La specifica completa della pipeline di *eval* può arrivare in PR successive; questo documento ne fissa formato dei casi, metriche, soglie iniziali, gate CI e regola di regressione.
Alimenta il miglioramento del [flusso RAG](../architettura/flusso-rag.md).
