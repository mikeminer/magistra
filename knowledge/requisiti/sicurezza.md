---
type: Concetto
title: Sicurezza
description: Cifratura dei segreti e dei dati sensibili e gestione delle credenziali in una piattaforma single-utente self-hostata.
tags: [sicurezza, cifratura, self-hosting]
timestamp: 2026-06-20T00:00:00Z
---

# Sicurezza

Requisiti di sicurezza trasversali, in particolare per la gestione di credenziali e documenti riservati.
Essendo una versione **single-utente** self-hostata, non c'è controllo accessi tra utenti: la protezione si concentra sulla macchina/istanza, sui segreti e sui dati a riposo e in transito.

## Aree

- **Cifratura dei segreti**: le [API key](/modello-dati/chiave-api.md) dell'istanza sono [cifrate](/glossario/cifratura.md) a riposo; mai in chiaro nel database o nei log. Vedi [gestione delle API key](/architettura/gestione-api-key.md).
- **Cifratura in transito e a riposo**: comunicazioni su TLS; documenti nell'[object storage](/architettura/object-storage.md) protetti.
- **Gestione dei segreti**: chiavi di cifratura e credenziali fornite via configurazione d'ambiente, non versionate (vedi [deployment](/architettura/deployment.md)).
- **Riduzione della superficie**: il [self-hosting](/glossario/self-hosting.md) mantiene i dati nell'ambiente dell'organizzazione.

> Bozza concettuale: la scelta degli algoritmi e la gestione del ciclo di vita delle chiavi saranno definite nel documento di design.
Strettamente legata alla [privacy](/requisiti/privacy-e-dati-personali.md).
