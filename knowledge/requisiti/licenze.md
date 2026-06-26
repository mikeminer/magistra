---
type: Concetto
title: Licenze
description: Licenza proposta per il software (AGPL-3.0-or-later) e condizioni di riuso dei dati delle fonti normative e giurisprudenziali.
tags: [licenze, agpl, riuso-dati]
timestamp: 2026-06-26T00:00:00Z
---

# Licenze

Due piani distinti: la licenza del **software** e le condizioni di riuso dei **dati** delle fonti.

## Software

- Proposta: **AGPL-3.0-or-later**, per garantire che le derivazioni — incluse quelle erogate come servizio — restino aperte.
- È la licenza già dichiarata nel `package.json` del repository (`AGPL-3.0-or-later`).

## Dati delle fonti

Principio comune: per l'**art. 5 della legge sul diritto d'autore** (L. 22 aprile 1941, n. 633) *i testi degli atti ufficiali dello Stato e delle amministrazioni pubbliche non sono protetti* dal diritto d'autore.
Il **contenuto** di leggi, decreti e sentenze è quindi liberamente riutilizzabile; i vincoli derivano dalle **banche dati e dai portali** che li distribuiscono (formato, compilazione, diritto *sui generis* sulle banche dati, marchi).

### Tabella delle licenze per fonte

| [Fonte](/fonti/index.md) | Licenza del dataset/portale | Obblighi | Note operative |
|---|---|---|---|
| [Normattiva](/fonti/normattiva.md) | **CC BY 4.0** (dati aperti dal 1° gennaio 2026, bulk + API) | Attribuzione; indicare il carattere **non autentico** del testo | Fonte **canonica** per i testi normativi |
| [EUR-Lex](/fonti/eur-lex.md) | Riuso libero (**Dec. 2011/833/UE**); contenuti editoriali e testi consolidati **CC BY 4.0**; metadati **CC0 1.0** | Attribuzione; indicare le modifiche | Esclusi loghi/marchi UE e opere di terzi |
| [Corte Costituzionale](/fonti/giurisprudenza.md) | **CC BY-SA 3.0** (pronunce e massime, endpoint SPARQL) | Attribuzione **+ condivisione allo stesso modo** (*share-alike*) sui dati | Unica fonte giurisprudenziale apertamente licenziata integrata in questa fase |
| [Gazzetta Ufficiale](/fonti/gazzetta-ufficiale.md) | Nessuna licenza aperta esplicita (portale IPZS) | Attribuzione; carattere non autentico | Usata per **date e metadati** di pubblicazione; il testo si prende da Normattiva |
| Corte di Cassazione | Da definire (DB senza licenza aperta, accesso limitato) | Da definire | Testo delle sentenze libero (art. 5), ma riuso del DB da approfondire — vedi [#24](https://github.com/Italian-Builders-Org/magistra/issues/24) |

### Decisioni operative

- **Testo normativo**: la fonte canonica è sempre [Normattiva](/fonti/normattiva.md) (CC BY 4.0); la [Gazzetta Ufficiale](/fonti/gazzetta-ufficiale.md) si usa solo per date e metadati di pubblicazione.
- **Giurisprudenza**: in questa fase si integra solo la [Corte Costituzionale](/fonti/giurisprudenza.md) (apertamente licenziata); la mappatura di Cassazione e altre fonti è demandata all'approfondimento dedicato ([#24](https://github.com/Italian-Builders-Org/magistra/issues/24)).
- **Licenza dei dati distinta dal software**: ogni dato ridistribuito nel bundle mantiene la **propria** licenza. In particolare i contenuti della Corte Costituzionale restano **CC BY-SA 3.0** (attribuzione + share-alike); il software resta [AGPL-3.0-or-later](/requisiti/licenze.md) (piano distinto).
- **Compatibilità**: CC BY 4.0 e CC0 non pongono vincoli oltre l'attribuzione; **CC BY-SA 3.0** impone di ridistribuire i dati derivati con licenza compatibile e con attribuzione.

## Principi (da AGENTS.md)

- **Attribuzione**: mantenere e mostrare la paternità della fonte.
- **Tracciabilità**: per ogni documento conservare fonte, [URI ELI](/modello-dati/uri-eli.md), formato originario e data di acquisizione.
- **Nessuna alterazione del significato** del testo normativo.
