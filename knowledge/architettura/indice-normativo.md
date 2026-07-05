---
type: Componente
title: Indice normativo + Vector DB
description: Indice vettoriale del corpus normativo su LanceDB (motore embedded nativo, disk-based) per ricerca semantica con prefiltri sui metadati, distinto da PGlite e raggiunto dietro la sua interfaccia.
tags: [vector-db, lancedb, indice, retrieval]
timestamp: 2026-06-30T00:00:00Z
---

# Indice normativo + Vector DB

L'indice del corpus normativo è un [Vector DB](../glossario/vector-db.md) per [ricerca semantica](../glossario/ricerca-semantica.md) con prefiltri sui metadati (tipo di atto, [vigenza](../glossario/vigenza.md), ecc.). È alimentato dalla [pipeline di trasformazione](../modello-dati/pipeline-trasformazione.md) e popolato di [Chunk](../modello-dati/chunk.md).

È un componente **distinto** dal [database applicativo](./database-applicativo.md): usa un motore dedicato, **LanceDB**, non la stessa istanza PGlite.

## Perché un motore dedicato (e non PGlite + pgvector)

Un benchmark di scala — eseguito da @MiPnamic — ha misurato l'indice del corpus dentro PGlite + `pgvector` (Postgres in WASM, indice HNSW) e ne ha mostrato i limiti alla scala del corpus normativo:

- **Tetto di indirizzamento wasm32 (~4 GiB)**: a corpus pieno (milioni di [Chunk](../modello-dati/chunk.md) a 1024 dimensioni, più il grafo dell'indice) l'indice non entra nello spazio di indirizzamento della sandbox WASM.
- **Costruzione dell'indice fuori scala**: cresce in modo circa quadratico; già a 250k chunk — sotto la scala di un MVP — la build richiede ~17 minuti.
- **Query filtrate lente a runtime**: i filtri per metadato (vigenza, tipo atto), qui indispensabili, degradano a centinaia di millisecondi e peggiorano con la dimensione, in tensione col requisito di [risposta interattiva](../requisiti/requisiti-non-funzionali.md).

Per il **database applicativo** PGlite resta invece la scelta giusta (dati transazionali piccoli, zero dipendenze native): la conclusione riguarda **solo l'indice del corpus**.

## LanceDB

[LanceDB](https://lancedb.github.io/lancedb/) è un motore vettoriale **embedded in-process** con binari nativi precompilati cross-platform: convive con PGlite nella stessa [app desktop](./deployment.md) ed è un [componente non-TS dietro un confine netto](./stack-tecnologico.md). Risponde ai tre limiti sopra:

- **Disk-based (mmap)**: scala oltre la RAM verso milioni di vettori, senza il tetto di wasm32.
- **Prefiltro nativo per metadato** (scalar index): vigenza e tipo atto filtrano *prima* della ricerca ANN, dentro il motore — proprio il punto su cui `pgvector` in WASM degradava.
- **Embedded**: nessun servizio esterno; l'indice si **distribuisce già pronto** nel bundle e si usa in locale.

### Strategia dell'indice (piena precisione, recall prima di tutto)

Per non sacrificare la recall si evita la quantizzazione lossy (IVF_PQ) e si procede per gradi al crescere del corpus:

- **Scala MVP** (~10⁵–250k chunk): indice **flat/esatto**, recall 100%, nessun tuning.
- **In crescita**: **IVF_HNSW** (grafi HNSW dentro partizioni IVF, a piena precisione); il parametro da tarare è `nprobes` (troppo basso intacca la recall).
- **Corpus pieno**, se il footprint stringe: **IVF_HNSW + RaBitQ** con rerank a piena precisione.

L'indice è raggiunto **dietro la sua interfaccia** (vedi [confini dietro interfacce](./stack-tecnologico.md)), così il motore resta sostituibile.

> Follow-up aperto: il benchmark di scala di @MiPnamic usava vettori sintetici e quindi misura build, latenza e footprint, **non la recall** reale. Il passo successivo è una misura di recall su dati veri tra i candidati a piena precisione (LanceDB IVF_HNSW ± RaBitQ, con USearch come riserva), così la taratura è davvero misurata.
