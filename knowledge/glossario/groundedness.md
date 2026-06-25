---
type: Termine
title: Groundedness (aderenza alle fonti)
description: Grado in cui ogni affermazione di una risposta è effettivamente supportata dai documenti recuperati dall'indice.
tags: [glossario, tecnico, qualita]
timestamp: 2026-06-25T00:00:00Z
---

# Groundedness (aderenza alle fonti)

Grado in cui ogni affermazione di una risposta è **effettivamente supportata** dai [chunk](/modello-dati/chunk.md) recuperati, e non aggiunta dal modello a memoria.

È la proprietà che la piattaforma massimizza e contrasta direttamente l'[allucinazione](/glossario/allucinazione.md) (in particolare l'affermazione non supportata dalle fonti recuperate). Va però distinta dalla verità in assoluto: un'affermazione può essere aderente a un chunk e ciò nondimeno errata se la fonte è sbagliata. È una delle metriche centrali della [valutazione della qualità](/requisiti/valutazione-qualita.md) ed è resa verificabile dalle [citazioni](/glossario/citazione-verificabile.md).
