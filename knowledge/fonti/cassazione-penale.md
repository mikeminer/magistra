---
type: Fonte Dati
title: Cassazione penale
description: Fonte prioritaria per orientamenti di legittimità necessari al ragionamento strategico penale.
tags: [cassazione, penale, giurisprudenza, orientamenti]
timestamp: 2026-06-23T00:00:00Z
---

# Cassazione penale

La Cassazione penale è una fonte prioritaria per Magistra. Nel dominio penale non basta recuperare la norma: molte decisioni difensive dipendono dagli orientamenti di legittimità, dalla loro stabilità e dal modo in cui qualificano casi simili.

Per questo la giurisprudenza di legittimità penale non deve restare un'aggiunta remota: è parte del motore del [ragionamento strategico difensivo](/funzionalita/ragionamento-strategico.md).

## Uso nel prodotto

- Collegare fatti e istituti a orientamenti di legittimità.
- Distinguere orientamenti consolidati, contrasti e arresti recenti.
- Supportare riti, misure cautelari, impugnazioni, esecuzione, benefici e calcolo scenari.
- Permettere domande per [fattispecie](/glossario/fattispecie.md), non solo per numero di norma.

## Implementazione MVP

Il primo connector importa le schede pubbliche della pagina istituzionale `Giurisprudenza Penale` della Corte Suprema di Cassazione:

- numero sentenza, sezione, data deposito e data udienza quando presenti;
- materia, oggetto ed esito in sintesi;
- URL della scheda ufficiale e link al PDF quando pubblicato;
- chunk interrogabili nel database locale con fonte `Cassazione penale`.

Questo non equivale ancora a un corpus completo Italgiure/Massimario. Per la pre-release il sistema usa queste schede come orientamenti verificabili e segnala quando la giurisprudenza disponibile non è sufficiente.

## Metadati minimi

Ogni decisione o massima importata dovrebbe conservare:

- corte, sezione, numero e data;
- data di deposito;
- eventuale numero Rv o identificativo equivalente;
- materia e istituti;
- norme richiamate;
- principio di diritto o massima;
- link alla fonte;
- stato di verifica della fonte e condizioni di riuso.

## Requisiti

- Le condizioni di accesso e riuso devono essere verificate prima dell'ingest.
- Se il testo integrale non è riusabile, il sistema può conservare solo metadati, citazioni, link e appunti verificati secondo licenza.
- La risposta deve separare sempre testo normativo, principio giurisprudenziale e inferenza strategica.
- Gli aggiornamenti devono essere frequenti: in penale gli orientamenti possono incidere direttamente sulla convenienza della scelta difensiva.

Vedi [Giurisprudenza](/fonti/giurisprudenza.md) e [orientamento giurisprudenziale](/glossario/orientamento-giurisprudenziale.md).
