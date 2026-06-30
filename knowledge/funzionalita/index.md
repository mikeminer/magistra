---
type: Indice
title: Funzionalità
description: Le capacità che la piattaforma offre all'utente — assistente, ragionamento strategico, calcolo di pene e termini, ricerca, analisi e redazione documenti, revisione tabellare, workflow e progetti.
tags: [funzionalita, prodotto, assistente]
timestamp: 2026-06-27T00:00:00Z
---

# Funzionalità

Questa cartella descrive **cosa fa** la piattaforma dal punto di vista dell'utente: ogni funzionalità è un concetto autonomo, indipendente dall'implementazione.
È il riferimento per il documento di specifiche.

> La selezione di ciò che entra nella prima release è in [Ambito MVP](../requisiti/mvp.md). **Nell'MVP**: [assistente legale](./assistente-legale.md), [ricerca normativa](./ricerca-normativa.md), [confronto versioni](./confronto-versioni.md), [verifica delle citazioni giurisprudenziali](./verifica-citazioni-giurisprudenza.md) (lookup) e [analisi di documenti](./analisi-documenti.md). Le altre funzionalità sono rinviate alle fasi successive.

## Assistente e conoscenza normativa

- [Assistente legale (chat)](./assistente-legale.md) — dialogo in linguaggio naturale con risposte ancorate alle fonti.
- [Ragionamento strategico](./ragionamento-strategico.md) — opzioni e scenari ragionati che incrociano norme, orientamenti di legittimità e calcoli. È il principale elemento di differenziazione.
- [Calcolo di pene e termini](./calcolo-pena-termini.md) — computo regolato di termini e limiti di pena (continuazione, prescrizione, impugnazioni) a supporto del ragionamento strategico.
- [Ricerca normativa](./ricerca-normativa.md) — ricerca semantica, per parola chiave e **per fattispecie** sul corpus.
- [Confronto versioni](./confronto-versioni.md) — navigazione del testo vigente e delle versioni storiche.
- [Riferimenti incrociati](./riferimenti-incrociati.md) — collegamenti automatici tra norme, codici e diritto UE.
- [Verifica delle citazioni giurisprudenziali](./verifica-citazioni-giurisprudenza.md) — controllo che una sentenza citata esista e sia pertinente.

## Lavoro sui documenti

- [Analisi di documenti](./analisi-documenti.md) — caricamento di contratti e atti per riassunti, clausole e verifica dei riferimenti.
- [Redazione di documenti](./redazione-documenti.md) — generazione di bozze a partire da istruzioni e modelli.
- [Revisione con modifiche tracciate](./revisione-tracciata.md) — editing puntuale con tracked changes e versioning.
- [Operazioni multi-documento](./operazioni-multi-documento.md) — applicare la stessa modifica o analisi a più documenti insieme.
- [Revisione tabellare](./revisione-tabellare.md) — estrazione di dati da molti documenti in una tabella.

## Organizzazione e automazione

- [Progetti](./progetti.md) — raccolte di documenti e conversazioni per organizzare il lavoro.
- [Workflow](./workflow.md) — istruzioni e preset salvati e riutilizzabili.

## Principi

- **Citazione prima di tutto**: ogni affermazione normativa rimanda a una [citazione verificabile](../glossario/citazione-verificabile.md).
- **Dalla legge alla strategia**: oltre a trovare la norma, la piattaforma aiuta a [ragionare sulle scelte](./ragionamento-strategico.md) e sulle loro conseguenze, restando un supporto alla decisione del professionista.
- **Controllo dell'utente sui dati**: i documenti caricati restano sulla sua macchina (vedi [privacy](../requisiti/privacy-e-dati-personali.md)).
- **Trasparenza**: l'utente vede sempre le fonti su cui si basa una risposta.
