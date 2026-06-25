---
type: Componente
title: Worker / runtime dei job
description: Processo separato dall'API che esegue i job batch — ingest del corpus, parsing AKN pesante, embedding massivo e reindicizzazioni — così che l'assistente resti reattivo.
tags: [worker, ingest, batch, architettura]
timestamp: 2026-06-25T00:00:00Z
---

# Worker / runtime dei job

Componente dedicato all'esecuzione dei **job batch** del sistema, separato dal processo che serve le richieste in tempo reale del [backend / API](/architettura/backend-api.md).
Esegue la [pipeline di trasformazione](/modello-dati/pipeline-trasformazione.md) e ogni operazione pesante che alimenta l'[indice normativo](/architettura/indice-normativo.md).

## Responsabilità

- **Ingest del corpus** da [Normattiva](/fonti/normattiva.md): download e parsing [Akoma Ntoso](/glossario/akoma-ntoso.md), spesso CPU-bound e correctness-critical.
- **Chunking** per unità (articolo / comma) con i metadati di [citazione verificabile](/glossario/citazione-verificabile.md).
- **Embedding massivo** e **reindicizzazioni** estese.
- **Refresh** e aggiornamento dell'indice quando il corpus cambia.
- Gestione dei file problematici (es. AKN rotto) in quarantena, senza interrompere l'assistente.

## Perché un processo separato

Far girare l'ingest pesante nello stesso processo dell'API è fragile, **indipendentemente dal linguaggio**: un re-ingest può saturare la CPU, un XML molto grande può far esplodere la memoria fino all'OOM, un errore non gestito nel parser può abbattere l'intero processo. In tutti questi casi le richieste di chat andrebbero in timeout o l'assistente cadrebbe insieme al job.

Separando l'API dal worker, **l'assistente resta reattivo** anche durante un re-ingest, un aggiornamento o la quarantena di un file rotto. È il requisito di [affidabilità](/requisiti/requisiti-non-funzionali.md) tradotto in struttura.

## Un job separato, non un servizio sempre attivo

Nell'[app desktop](/architettura/deployment.md) l'ingest pesante **non gira sulla macchina dell'utente** durante l'uso normale: l'utente riceve un [indice già pronto](/architettura/deployment.md). Il worker è quindi un **job batch separato** dall'assistente — non un servizio always-on — eseguito quando serve costruire o aggiornare l'indice.

> Nota: l'ingest del corpus normativo non viene eseguito sul dispositivo di ogni utente finale. È un'operazione che il team svolge in un **ambiente controllato**, distribuendo un indice già pronto; l'utente "pro" può comunque rieseguirla da sé, perché la relativa logica vive nel repository. Vedi [pipeline di trasformazione](/modello-dati/pipeline-trasformazione.md) e [deployment](/architettura/deployment.md).
