---
type: Fonte Dati
title: Normattiva — Open Data
description: Fonte primaria per la legislazione statale italiana (leggi, decreti, codici), in formato Akoma Ntoso con identificatori URN-NIR ed ELI.
resource: https://dati.normattiva.it/
tags: [fonte-primaria, normattiva, akoma-ntoso, eli]
timestamp: 2026-06-26T00:00:00Z
---

# Normattiva — Open Data (fonte primaria)

Portale: <https://dati.normattiva.it/>

La fonte principale per la legislazione statale italiana (leggi, decreti legge, decreti legislativi, regi decreti, codici). Il portale è realizzato dall'Istituto Poligrafico e Zecca dello Stato ed è governato dal comitato di gestione Normattiva (presieduto dal DAGL della Presidenza del Consiglio).

## Formati disponibili

| Formato | Descrizione | Uso in Magistra |
|---|---|---|
| **[Akoma Ntoso (LegalDOCML)](/glossario/akoma-ntoso.md)** | XML giuridico strutturato, standard OASIS | Fonte canonica per il parsing |
| **[XML NIR](/glossario/xml-nir.md)** (NormeInRete) | Standard XML precedente (AIPA/CNIPA) | Fallback / atti storici |
| **JSON** | Rappresentazione strutturata | Ingest rapido / metadati |
| **HTML** | Testo formattato | Anteprima / debug |
| **URN-NIR** | Identificatore nativo e canonico di Normattiva (`urn:nir:...`) | Identità permanente dell'atto |
| **[URI ELI](/glossario/eli.md)** | Identificatori permanenti europei (European Legislation Identifier), affiancati a URN-NIR | Chiave stabile di riferimento, interoperabilità UE |

## Esportazioni temporali

- **Versione originaria**: testo come pubblicato in origine.
- **Vigente a una data**: testo in vigore a una data specifica.
- **Multivigente**: tutte le versioni nel tempo (fondamentale per il confronto storico). Vedi [multivigenza](/glossario/multivigenza.md).

## Riuso

Dal **1° gennaio 2026** i dati di `dati.normattiva.it` sono pubblicati come dati aperti con licenza **Creative Commons Attribution 4.0 (CC BY 4.0)**, con download massivo (*bulk*) e API.
Obblighi: **citare la fonte** e indicare il **carattere non autentico** del testo (il testo ufficiale e definitivo resta quello pubblicato in [Gazzetta Ufficiale](/fonti/gazzetta-ufficiale.md)).
È la **fonte canonica** per i testi normativi della piattaforma. Quadro completo in [licenze](/requisiti/licenze.md).
