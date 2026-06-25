---
type: Concetto
title: Sicurezza
description: Cifratura dei segreti e dei dati sensibili e gestione delle credenziali in un'app desktop single-utente locale.
tags: [sicurezza, cifratura, locale]
timestamp: 2026-06-25T00:00:00Z
---

# Sicurezza

Requisiti di sicurezza trasversali, in particolare per la gestione di credenziali e documenti riservati.
Essendo un'app **single-utente** che gira in locale, non c'è controllo accessi tra utenti: la protezione si concentra sulla macchina, sui segreti e sui dati a riposo e in transito.

## Aree

- **Cifratura dei segreti**: le [API key](/modello-dati/chiave-api.md) locali sono [cifrate](/glossario/cifratura.md) a riposo; mai in chiaro nel database o nei log. Vedi [gestione delle API key](/architettura/gestione-api-key.md).
- **Dati a riposo e in transito**: i documenti nell'[archiviazione locale](/architettura/archiviazione-documenti.md) sono protetti a riposo; l'unico traffico in uscita è quello *opzionale* verso un [provider LLM](/architettura/provider-llm.md) remoto o l'aggiornamento dell'indice, che avviene su TLS. Non esiste comunicazione client-server interna, perché l'app gira tutta in locale.
- **Gestione dei segreti**: le chiavi di cifratura e le credenziali sono conservate nel secure storage del sistema operativo (keychain) o in uno store locale cifrato, mai versionate (vedi [deployment](/architettura/deployment.md)).
- **Riduzione della superficie**: l'esecuzione interamente locale mantiene i dati sulla macchina dell'utente.
- **Igiene delle dipendenze (supply-chain)**: i registri di pacchetti condividono la stessa classe di rischi (typosquatting, script di installazione malevoli) a prescindere dal linguaggio dello [stack](/architettura/stack-tecnologico.md); la difesa è una disciplina sulle dipendenze (selezione, fissaggio delle versioni, aggiornamenti controllati, audit), non una proprietà del linguaggio.

> Bozza concettuale: la scelta degli algoritmi e la gestione del ciclo di vita delle chiavi saranno definite nel documento di design.
Strettamente legata alla [privacy](/requisiti/privacy-e-dati-personali.md).
