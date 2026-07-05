---
type: Concetto
title: Ragionamento strategico
description: Analisi di scenari che incrocia norme, orientamenti di legittimità e calcolo di pene e termini per restituire all'avvocato opzioni ragionate con le loro conseguenze.
tags: [strategia, ragionamento, penale, differenziante]
timestamp: 2026-06-29T00:00:00Z
---

# Ragionamento strategico

La capacità che distingue Magistra dagli altri strumenti: non si limita a **trovare la norma**, ma aiuta il professionista a **ragionare sulla strategia**. Un avvocato non lavora su un termine o una norma alla volta: ragiona su **scenari**, dove ogni scelta condiziona la fase successiva.

> Funzionalità di **Fase 2**: per l'[MVP](../requisiti/mvp.md) la verifica delle citazioni di giurisprudenza è di solo *lookup* e il corpus della [Cassazione](../fonti/giurisprudenza.md) non è ancora integrato, quindi il ragionamento strategico non è in MVP (vedi [Roadmap](../requisiti/roadmap.md)).
> La sezione [Portata (Fase 2)](#portata-fase-2) fissa la direzione della feature; la specifica di dettaglio si scrive all'avvio della Fase 2.

## Cosa fa

A partire dalla situazione concreta di un caso (la [fattispecie](../glossario/fattispecie.md) e i suoi dati: precedenti dell'assistito, fase processuale, pena in gioco), l'assistente:

- **Incrocia** norme, [orientamenti di legittimità](../glossario/orientamento-giurisprudenziale.md) della [Cassazione](../fonti/giurisprudenza.md) e [calcolo di pene e termini](./calcolo-pena-termini.md).
- Costruisce e confronta **scenari processuali** alternativi.
- Restituisce **opzioni ragionate** con le loro **conseguenze**, personalizzate sul singolo caso.

Ogni opzione è **ancorata** a [citazioni verificabili](../glossario/citazione-verificabile.md) (norme e pronunce) e ai calcoli che la sostengono: è il [RAG agentico](../glossario/rag-agentico.md) esteso al ragionamento multi-passo, non un'opinione generata a memoria.

## Esempi (penale)

- **Decreto penale di condanna: accettare o opporsi**: valutare se lasciare che il decreto diventi esecutivo o proporre **opposizione** ex art. 461 c.p.p. L'opposizione evita l'esecuzione immediata e, contestualmente, apre l'accesso ai riti alternativi (può chiedere **patteggiamento**, abbreviato o oblazione). A giudicato formato, una pluralità di condanne può poi essere ricondotta a unità con l'**incidente di esecuzione per la continuazione ex art. 671 c.p.p. (art. 81 c.p.)**, così da rideterminare la pena e agevolare l'accesso alle misure alternative.
- **Precedenti specifici e sospensione condizionale**: per un assistito con precedenti, valutare se puntare alla **prescrizione del secondo reato** per evitare che una nuova pena diventi esecutiva e provochi la **revoca della sospensione** concessa con il primo.

Gli esempi sono penali — il ramo in cui questo ragionamento è più evidente — ma la stessa logica (incrociare fonti, calcolare conseguenze, confrontare opzioni) vale anche per gli altri rami del diritto.

## Perché serve la giurisprudenza di legittimità

Gli [orientamenti della Cassazione](../glossario/orientamento-giurisprudenziale.md) cambiano spesso e sono il **presupposto** del ragionamento strategico: senza di essi l'assistente può calcolare termini e pene ma non valutare la **convenienza** di una scelta. Per questo la giurisprudenza di legittimità è una fondazione, non un'aggiunta successiva (vedi [Roadmap](../requisiti/roadmap.md)).

## Portata (Fase 2)

Decisioni di prodotto che fissano i confini della feature al suo lancio (Fase 2).

### Rami del diritto al lancio

Il ragionamento strategico nasce **sul penale**: è il ramo in cui incrociare norme, [orientamenti di legittimità](../glossario/orientamento-giurisprudenziale.md) e [calcolo di pene e termini](./calcolo-pena-termini.md) produce il valore più evidente (riti alternativi, prescrizione, sospensione condizionale, continuazione in esecuzione).
Gli altri rami arrivano in **estensione progressiva** dopo il lancio: la logica è la stessa, ma ogni ramo richiede di mappare le proprie fonti e i propri calcoli prima di garantirne la qualità.
Partire da un solo ramo tiene il perimetro controllato e la qualità verificabile, in linea con i [criteri di inclusione dell'MVP](../requisiti/mvp.md).

### Profondità degli scenari

Lo strumento costruisce **scenari multi-passo**: a partire dalla situazione del caso confronta **opzioni alternative** e ne mostra le **conseguenze a catena**, dove ogni scelta condiziona la fase successiva (come negli [esempi penali](#esempi-penale)).
Non si ferma alla singola opzione isolata: il valore sta nel rendere esplicito l'albero delle alternative e dei loro effetti.

### Input richiesti sul caso concreto

L'utente fornisce input **strutturati ma minimi**: la [fattispecie](../glossario/fattispecie.md) e i dati chiave del caso (fase processuale, precedenti dell'assistito, pena in gioco, termini rilevanti).
Quando mancano dati necessari per costruire uno scenario, **l'assistente li richiede** invece di assumerli: nessuno scenario si fonda su dati inventati.

### Integrazione con calcolo e giurisprudenza

Ogni scenario poggia su due fondazioni:
- il [calcolo di pene e termini](./calcolo-pena-termini.md), che quantifica le conseguenze di ciascuna opzione;
- gli [orientamenti di legittimità](../glossario/orientamento-giurisprudenziale.md) della [Cassazione](../fonti/giurisprudenza.md), che ne valutano la **convenienza** alla luce della giurisprudenza vigente.

Per questo il ragionamento strategico non può precedere l'integrazione del corpus di legittimità: è un suo prerequisito, non un'aggiunta (vedi [Roadmap](../requisiti/roadmap.md)).

### Garanzie e limiti

- Ogni opzione è **ancorata a [citazioni verificabili](../glossario/citazione-verificabile.md)** (norme e pronunce) e ai calcoli che la sostengono: niente affermazioni generate a memoria.
- Lo strumento **non sceglie** per l'utente e non esprime raccomandazioni perentorie: presenta opzioni, scenari e conseguenze tracciabili.
- Nessuna garanzia di esito: gli scenari descrivono conseguenze possibili date le fonti, non previsioni.

## Confine: supporto alla decisione, non consulenza

Lo strumento **affianca la decisione del professionista**, non la sostituisce: presenta opzioni, scenari e conseguenze con le relative fonti, ma la scelta resta dell'avvocato. Non fornisce consulenza legale e non garantisce esiti; la sua utilità sta nel rendere esplicite e tracciabili le alternative.

Vedi [assistente legale](./assistente-legale.md), [ricerca per fattispecie](./ricerca-normativa.md), [calcolo di pene e termini](./calcolo-pena-termini.md) e [flusso RAG](../architettura/flusso-rag.md).
