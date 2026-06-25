---
type: Componente
title: Anonimizzazione reversibile dei dati sensibili
description: Layer opzionale che, quando si usa un provider LLM remoto, sostituisce i dati sensibili con segnaposto prima dell'invio e li ripristina nella risposta, tenendo la mappatura solo in locale.
tags: [privacy, anonimizzazione, llm]
timestamp: 2026-06-25T00:00:00Z
---

# Anonimizzazione reversibile dei dati sensibili

Ipotesi di un layer che riduce il rischio quando l'utente sceglie un [provider LLM](/architettura/provider-llm.md) **remoto**: poiché in quel caso ciò che viene inviato lascia la macchina (vedi [riservatezza come leva primaria](/requisiti/privacy-e-dati-personali.md)), il layer **rimuove o trasforma i dati sensibili prima dell'invio** e li **ripristina** dopo l'interazione con il modello.

> Bozza concettuale / ipotesi: da validare nel documento di design.

## Come funziona (anonimizza → elabora → de-anonimizza)

1. **Rilevamento** (locale): individua le entità sensibili — nomi di assistiti e controparti, codice fiscale, partita IVA, indirizzi, ecc. — con NER + espressioni regolari + regole di contesto.
2. **Pseudonimizzazione** (locale): sostituisce ogni entità con un **segnaposto** stabile; la mappatura segnaposto ↔ valore originale è conservata in un **vault locale** [cifrato](/glossario/cifratura.md) che non lascia mai la macchina.
3. **Invio**: al provider remoto va **solo il testo anonimizzato**.
4. **Ripristino** (locale): nella risposta del modello i segnaposto vengono risostituiti con i valori originali tramite il vault.

Tutto ciò che è sensibile, insieme alla mappatura, resta in locale; al provider arriva solo testo anonimizzato.

## Strumenti candidati (OSS)

- **[Microsoft Presidio](https://microsoft.github.io/presidio/)** (licenza MIT): rilevamento, anonimizzazione e de-anonimizzazione; estensibile con *recognizer* personalizzati; supporta l'**italiano** (modello spaCy `it_core_news_md`) e può essere adattato alle entità del dominio legale italiano (codice fiscale, P.IVA, estremi di causa).
- **[LLM Guard](https://llm-guard.com/)** (Protect AI, OSS): costruito su Presidio, fornisce gli scanner *Anonymize*/*Deanonymize* e un **Vault** per la mappatura reversibile — esattamente il pattern descritto.

> Nota stack: questi strumenti sono in Python; eseguirli come **processo/servizio locale** è coerente con l'architettura, che già prevede sottoprocessi esterni (vedi [stack tecnologico](/architettura/stack-tecnologico.md)). In alternativa esistono librerie JS/TS di rilevamento e pseudonimizzazione di PII, in genere meno mature di Presidio. Il vincolo è che tutto giri **in locale**.

## Limiti e cautele

- È una **mitigazione opzionale** per il caso "provider remoto": i [modelli eseguiti in locale](/architettura/provider-llm.md) restano la garanzia più forte, perché nessun dato esce.
- Il rilevamento è **imperfetto** (falsi negativi): serve messa a punto sull'italiano e sul lessico legale e, idealmente, una **revisione dell'utente** prima dell'invio.
- L'anonimizzazione può **ridurre la qualità** della risposta se il modello ha bisogno delle entità reali per ragionare: è un trade-off utilità/privacy.
- Il vault va [cifrato](/glossario/cifratura.md) (vedi [sicurezza](/requisiti/sicurezza.md)) e i segnaposto devono restare coerenti per non perdere le relazioni nel testo.
