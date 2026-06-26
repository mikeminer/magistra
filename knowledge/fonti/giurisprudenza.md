---
type: Fonte Dati
title: Giurisprudenza
description: Mappa delle fonti giurisprudenziali italiane ed europee integrabili, con stato di licenza e copertura (Corte Costituzionale, Cassazione, giustizia amministrativa, merito).
resource: https://www.cortecostituzionale.it/
tags: [giurisprudenza, sentenze, legittimita]
timestamp: 2026-06-26T00:00:00Z
---

# Giurisprudenza

Sentenze e orientamenti dei giudici. Questa scheda mappa le fonti **integrabili**, con stato di licenza e copertura; il quadro licenze completo è in [licenze](/requisiti/licenze.md).

## Mappa delle fonti integrabili

| Fonte | Accesso e formati | Licenza | Copertura | Uso in Magistra |
|---|---|---|---|---|
| **Corte Costituzionale** (<https://dati.cortecostituzionale.it/>) | Open data (csv/json/xml) + **SPARQL**, download massivo | **CC BY-SA 3.0** | ~20.000 pronunce **dal 1956** + massime | **Ingest pieno** (fonte aperta di riferimento) |
| **Corte di Cassazione** — SentenzeWeb (<https://www.italgiure.giustizia.it/>) | Ricerca web libera, senza registrazione; **no API/bulk** pubblico | Testo libero (art. 5 L. 633/1941); DB **senza licenza aperta**; massime CED a pagamento | Civili, penali e Sezioni Unite, full-text **dal 2011/2012** | **Verifica citazioni / lookup**; banca dati CED commerciale **post-MVP** |
| **Giustizia amministrativa** — Consiglio di Stato e TAR | Ricerca libera ("uso studio e consultazione") + **[Open GA Open Data](https://openga.giustizia-amministrativa.it)** (dataset CKAN, DCAT-AP_IT) | **CC BY 4.0** (Open GA) | Sentenze, ordinanze, decreti, pareri del giudice amministrativo | **Fonte integrabile** (apertamente licenziata) |
| **Merito** — Banca Dati di Merito Pubblica (BDP, via [PST](https://pst.giustizia.it/)) | Consultazione previa **autenticazione SPID/CIE/CNS**; download massivo riservato agli editori (convenzione AIE) | Nessuna licenza aperta; **ToS** che vietano classificazione/profilazione/confronto; dati pseudonimizzati | Provvedimenti **civili** di Tribunali e Corti d'appello **dal 1° gennaio 2016** (~3,5 mln); esclusi famiglia/minori/stato persona | **Fuori MVP** per l'ingest (accesso autenticato + vincoli ToS); valutare accesso dedicato in seguito |
| **Diritto UE (CGUE)** via [EUR-Lex](/fonti/eur-lex.md) | API / Cellar | Dec. 2011/833/UE; CC BY 4.0 | Giurisprudenza dell'Unione | Già coperto da [EUR-Lex](/fonti/eur-lex.md) |

Per il **merito** esistono inoltre raccolte libere solo **settoriali** (es. *Giurisprudenza delle Imprese*, per il diritto societario e industriale) o **progetti locali** (es. Brescia, università e uffici giudiziari): utili ma non sistematici.

## Decisioni (MVP)

- **Ingest pieno**: [Corte Costituzionale](https://dati.cortecostituzionale.it/) (CC BY-SA 3.0), unica fonte con licenza aperta e download massivo.
- **Cassazione**: nell'MVP serve per la **verifica delle citazioni** (testo libero per art. 5, ma DB senza licenza né bulk pubblico); l'integrazione della banca dati CED completa è **commerciale** e rimandata al post-MVP.
- **Giustizia amministrativa**: **integrabile** grazie agli open data **CC BY 4.0** di Open GA.
- **Merito**: la **BDP** copre il civile dal 2016 ma è ad **accesso autenticato** con **ToS restrittivi** (vietati profilazione/confronto) e bulk riservato agli editori → **fuori MVP**; in aperto restano solo nicchie settoriali e progetti locali.

## Riuso

Le condizioni per fonte sono riepilogate in [licenze](/requisiti/licenze.md). In sintesi: Corte Costituzionale **CC BY-SA 3.0** (attribuzione + *share-alike*); giustizia amministrativa **CC BY 4.0** (Open GA); Cassazione testo libero ma DB senza licenza aperta (uso in lookup); merito non disponibile in aperto in modo sistematico.

## Perché è una fondazione, non un'aggiunta

La giurisprudenza **di legittimità** della Cassazione non è materiale accessorio: i suoi [orientamenti](/glossario/orientamento-giurisprudenziale.md) cambiano spesso e sono il **presupposto** del [ragionamento strategico](/funzionalita/ragionamento-strategico.md). Senza di essi l'assistente può recuperare norme e calcolare termini, ma non valutare la **convenienza** di una scelta difensiva. Per questo va integrata fin dalle fasi iniziali — almeno per la **verifica delle citazioni** (vedi [Roadmap](/requisiti/roadmap.md)) — pur con i limiti di copertura e licenza delle fonti italiane.

Vedi anche il termine [giurisprudenza](/glossario/giurisprudenza.md) nel glossario.
