---
type: Componente
title: Archiviazione documenti (locale)
description: Salvataggio dei documenti caricati dall'utente e degli artefatti di ingest sul filesystem locale della macchina.
tags: [storage, documenti, filesystem]
timestamp: 2026-06-25T00:00:00Z
---

# Archiviazione documenti (locale)

Conserva i documenti caricati dall'utente e gli artefatti di [conversione](/architettura/conversione-documenti.md)/ingest. Essendo Magistra un'[app desktop locale](/architettura/deployment.md), l'archiviazione è il **filesystem locale** della macchina: nessun servizio esterno da avviare e i documenti non lasciano il computer dell'utente.

L'accesso passa da un'interfaccia dedicata, così il componente concreto (oggi il filesystem locale) resta isolato dal resto dell'applicazione.
