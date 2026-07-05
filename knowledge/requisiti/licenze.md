---
type: Concetto
title: Licenze
description: Licenza del software (AGPL-3.0-or-later, confermata) e condizioni di riuso dei dati delle fonti normative e giurisprudenziali.
tags: [licenze, agpl, riuso-dati]
timestamp: 2026-06-30T00:00:00Z
---

# Licenze

Due piani distinti: la licenza del **software** e le condizioni di riuso dei **dati** delle fonti.

## Software

- **Confermata: AGPL-3.0-or-later**, per garantire che le derivazioni — incluse quelle erogate come servizio — restino aperte.
- È la licenza già dichiarata nel `package.json` del repository (`AGPL-3.0-or-later`).
- Il testo integrale è nel file `LICENSE` alla radice del repository (GNU Affero General Public License v3).

## Dati delle fonti

Principio comune: per l'**art. 5 della legge sul diritto d'autore** (L. 22 aprile 1941, n. 633) *i testi degli atti ufficiali dello Stato e delle amministrazioni pubbliche non sono protetti* dal diritto d'autore.
Il **contenuto** di leggi, decreti e sentenze è quindi liberamente riutilizzabile; i vincoli derivano dalle **banche dati e dai portali** che li distribuiscono (formato, compilazione, diritto *sui generis* sulle banche dati, marchi).

### Tabella delle licenze per fonte

| [Fonte](../fonti/index.md) | Licenza del dataset/portale | Obblighi | Note operative |
|---|---|---|---|
| [Normattiva](../fonti/normattiva.md) | **CC BY 4.0** (dati aperti dal 1° gennaio 2026, bulk + API) | Attribuzione; indicare il carattere **non autentico** del testo | Fonte **canonica** per i testi normativi |
| [EUR-Lex](../fonti/eur-lex.md) | Riuso libero (**Dec. 2011/833/UE**); contenuti editoriali e testi consolidati **CC BY 4.0**; metadati **CC0 1.0** | Attribuzione; indicare le modifiche | Esclusi loghi/marchi UE e opere di terzi |
| [Corte Costituzionale](../fonti/giurisprudenza.md) | **CC BY-SA 3.0** (pronunce e massime, endpoint SPARQL) | Attribuzione **+ condivisione allo stesso modo** (*share-alike*) sui dati | Unica fonte giurisprudenziale apertamente licenziata integrata in questa fase |
| [Gazzetta Ufficiale](../fonti/gazzetta-ufficiale.md) | **Veste tipografica protetta** dall'IPZS; nessuna licenza aperta | Attribuzione; carattere non autentico | **No scraping diretto**: il testo si prende da Normattiva; la GU serve solo per **date e metadati** |
| Corte di Cassazione | Testo libero (art. 5); **portali aperti** per l'MVP, servizi commerciali (CED/DeJure) restrittivi | Attribuzione | **MVP**: fonti aperte (giustizia.it/SentenzeWeb); integrazione commerciale **post-MVP** |
| [Giustizia amministrativa](../fonti/giurisprudenza.md) (Cons. Stato, TAR) | **CC BY 4.0** (Open GA Open Data) | Attribuzione | Provvedimenti del giudice amministrativo; **integrabile** |
| [Merito](../fonti/giurisprudenza.md) — Banca Dati Pubblica (BDP) | Nessuna licenza aperta; **ToS restrittivi**; bulk solo editori (conv. AIE) | — | Civili dal 2016, accesso autenticato (SPID); **fuori MVP** per l'ingest |

### Decisioni operative

- **Testo normativo**: la fonte canonica è sempre [Normattiva](../fonti/normattiva.md) (CC BY 4.0); della [Gazzetta Ufficiale](../fonti/gazzetta-ufficiale.md) **non si fa scraping diretto** (veste tipografica protetta), si usa solo per date e metadati di pubblicazione.
- **Riuso commerciale**: per Normattiva (CC BY 4.0) ed EUR-Lex (Dec. 2011/833/UE) il riuso è consentito **anche a fini commerciali**, con il solo obbligo di **attribuzione**: il corpus normativo non pone vincoli al modello di business.
- **Giurisprudenza**: ingest pieno della [Corte Costituzionale](../fonti/giurisprudenza.md) (CC BY-SA 3.0); la **giustizia amministrativa** è integrabile (Open GA, CC BY 4.0); la **Cassazione** nell'MVP serve per la verifica delle citazioni (testo libero, ma DB senza licenza/bulk), con banca dati CED commerciale **post-MVP**; il **merito** (BDP) resta **fuori MVP** (accesso autenticato, ToS restrittivi). Mappa completa in [giurisprudenza](../fonti/giurisprudenza.md).
- **Licenza dei dati distinta dal software**: ogni dato ridistribuito nel bundle mantiene la **propria** licenza. In particolare i contenuti della Corte Costituzionale restano **CC BY-SA 3.0** (attribuzione + share-alike); il software resta [AGPL-3.0-or-later](./licenze.md) (piano distinto).
- **Compatibilità**: CC BY 4.0 e CC0 non pongono vincoli oltre l'attribuzione; **CC BY-SA 3.0** impone di ridistribuire i dati derivati con licenza compatibile e con attribuzione.

## Principi (da AGENTS.md)

- **Attribuzione**: mantenere e mostrare la paternità della fonte.
- **Tracciabilità**: per ogni documento conservare fonte, [URI ELI](../modello-dati/uri-eli.md), formato originario e data di acquisizione.
- **Nessuna alterazione del significato** del testo normativo.
