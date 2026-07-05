---
type: Componente
title: Frontend (React + Vite)
description: Interfaccia di chat, ricerca e visualizzazione documenti in React, impacchettata con Vite nel renderer di Electron, con i componenti UI in una libreria separata e portabile.
tags: [frontend, react, vite, typescript]
timestamp: 2026-07-01T00:00:00Z
---

# Frontend (React + Vite / TypeScript)

Interfaccia di chat, ricerca, caricamento e visualizzazione documenti con [citazioni](../glossario/citazione-verificabile.md) cliccabili che rimandano alla fonte ([ELI](../glossario/eli.md) / [Normattiva](../fonti/normattiva.md)).
È una **SPA React** che gira nel renderer di Electron e fa parte dello [stack TypeScript-first](./stack-tecnologico.md).

## React + Vite, non un framework full-stack

Il frontend usa **React** con **Vite** come build tool, non un framework full-stack.
La ragione è architetturale: il [backend](./backend-api.md) non è un server HTTP e la UI lo raggiunge via **IPC**, quindi non servono SSR, API route né un runtime server lato frontend.
Vite produce un **bundle statico** (HTML/JS/CSS) caricato nel renderer tramite un **protocollo applicativo locale** (es. `app://`), senza server né porte aperte. Vedi [packaging e distribuzione](./packaging-distribuzione.md).

## Componenti UI in una libreria separata

I **componenti di interfaccia** (presentazionali, agnostici rispetto al build tool e al runtime desktop) vivono in una **directory/libreria separata**, distinta dall'applicazione che li ospita.
L'app desktop (Electron + Vite) **consuma** questa libreria; i componenti non dipendono da Electron né da API specifiche del processo desktop, e ricevono dati e stato dall'applicazione, che li ottiene via IPC dal backend.

Il vantaggio è la **portabilità**: la UI resta isolata, riutilizzabile **oltre l'app desktop** e indipendente dal trasporto.
È lo stesso [principio dei confini dietro interfacce](./stack-tecnologico.md) applicato al frontend: i componenti sono il "cosa" si mostra, l'applicazione è il "dove" e "come" gira.
