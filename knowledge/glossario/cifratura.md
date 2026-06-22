---
type: Termine
title: Cifratura
description: Trasformazione di dati in forma illeggibile senza la chiave, usata per proteggere segreti e documenti a riposo e in transito.
tags: [glossario, sicurezza, cifratura]
timestamp: 2026-06-20T00:00:00Z
---

# Cifratura

Trasformazione di dati in una forma illeggibile senza la chiave corrispondente, per proteggerne la riservatezza.

Nella piattaforma è usata per le [chiavi API](/modello-dati/chiave-api.md) dell'istanza (cifrate a riposo, mai in chiaro nel database o nei log), per i [documenti](/modello-dati/documento.md) nell'[object storage](/architettura/object-storage.md) e per le comunicazioni in transito (TLS). È un requisito di [sicurezza](/requisiti/sicurezza.md) e [privacy](/requisiti/privacy-e-dati-personali.md).
