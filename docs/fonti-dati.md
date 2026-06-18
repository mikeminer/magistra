# Fonti dei dati

Questo documento mappa le fonti del diritto italiano utilizzabili da Italian-OSS-Legal-Platform, i formati disponibili e le condizioni di riuso. È il riferimento per chiunque lavori alla pipeline di ingest.

---

## 1. Normattiva — Open Data (fonte primaria)

Portale: <https://dati.normattiva.it/>

La fonte principale per la legislazione statale italiana (leggi, decreti legge, decreti legislativi, regi decreti, codici). Realizzato dall'Istituto Poligrafico e Zecca dello Stato su iniziativa del comitato di gestione Normattiva.

**Formati disponibili**

| Formato | Descrizione | Uso in Italian-OSS-Legal-Platform |
|---|---|---|
| **Akoma Ntoso (LegalDOCML)** | XML giuridico strutturato, standard OASIS | Fonte canonica per il parsing |
| **XML NIR** (NormeInRete) | Standard XML AgID precedente | Fallback / atti storici |
| **JSON** | Rappresentazione strutturata | Ingest rapido / metadati |
| **HTML** | Testo formattato | Anteprima / debug |
| **URI ELI** | Identificatori permanenti (European Legislation Identifier) | Chiave stabile di riferimento |

**Esportazioni temporali**

- **Versione originaria**: testo come pubblicato in origine.
- **Vigente a una data**: testo in vigore a una data specifica.
- **Multivigente**: tutte le versioni nel tempo (fondamentale per il confronto storico).

---

## 2. Gazzetta Ufficiale

Portale: <https://www.gazzettaufficiale.it/>

Fonte ufficiale di pubblicazione degli atti normativi. Utile per atti recenti, avvisi e per la verifica della data di pubblicazione/entrata in vigore.

---

## 3. EUR-Lex — Diritto dell'Unione Europea

Portale: <https://eur-lex.europa.eu/>

Regolamenti, direttive e decisioni UE, spesso collegati alla normativa nazionale di recepimento. Disponibili formati strutturati e URI **ELI europei**, con servizi di accesso (incl. SPARQL/Cellar).

---

## 4. Giurisprudenza

Sentenze e orientamenti, dove disponibili in formato aperto:

- **Corte Costituzionale** — <https://www.cortecostituzionale.it/>
- **Corte di Cassazione** — banca dati di legittimità (accesso e riuso variabili)

---

## Principi di trattamento dei dati

- **Attribuzione**: mantenere e mostrare la paternità.
- **Tracciabilità**: per ogni documento conservare fonte, URI ELI, formato originario, data di acquisizione e versione.
- **Nessuna alterazione del significato**: il testo normativo non va modificato; eventuali normalizzazioni devono essere reversibili e documentate.
- **Aggiornamento**: prevedere ri-ingest periodico per recepire modifiche e nuove versioni (multivigenza).
