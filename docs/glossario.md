# Glossario

Termini giuridici e tecnici ricorrenti nel progetto Italian-OSS-Legal-Platform.

## Termini giuridici

**Norma / atto normativo** — Disposizione giuridica vincolante (legge, decreto, regolamento, ecc.).

**Vigenza** — Periodo in cui una norma è in vigore. Una norma può avere più versioni nel tempo.

**Multivigenza** — Disponibilità di tutte le versioni storiche di una norma, ciascuna con il proprio intervallo di vigenza.

**Testo vigente** — Versione di una norma attualmente in vigore (a una certa data).

**Testo originario** — Versione della norma come pubblicata in origine, prima di modifiche.

**Abrogazione** — Cessazione dell'efficacia di una norma, totale o parziale.

**Comma** — Suddivisione interna di un articolo; unità tipica per le citazioni puntuali.

**Rubrica** — Titolo/intestazione di un articolo.

**Recepimento** — Atto nazionale che dà attuazione a una direttiva UE.

**Giurisprudenza** — Insieme delle decisioni dei giudici (es. Cassazione, Corte Costituzionale).

## Standard e formati

**Akoma Ntoso (AKN / LegalDOCML)** — Standard XML internazionale (OASIS) per rappresentare documenti giuridici in modo strutturato, con metadati.

**XML NIR (NormeInRete)** — Standard XML AgID precedente ad AKN per le norme italiane.

**ELI (European Legislation Identifier)** — Sistema di URI permanenti per identificare in modo stabile e interoperabile gli atti normativi a livello europeo.

**FRBR** — Modello (Work / Expression / Manifestation / Item) usato da AKN per gestire versioni, formati e derivazioni di un documento.

**Work / Expression / Manifestation / Item** — Vedi `docs/modello-dati.md`: rispettivamente la norma astratta, una sua versione, una sua rappresentazione in un formato, la copia concreta.

## Termini tecnici

**RAG (Retrieval-Augmented Generation)** — Tecnica in cui l'LLM genera risposte basandosi su documenti recuperati da un indice, anziché solo sulla memoria del modello. Permette citazioni verificabili.

**Embedding** — Rappresentazione vettoriale di un testo, usata per la ricerca semantica.

**Ricerca semantica** — Ricerca per significato/concetto, non solo per corrispondenza di parole chiave.

**Chunk** — Porzione di testo (es. un comma) indicizzata per il retrieval, con i metadati di citazione.

**Vector DB** — Database ottimizzato per ricerche su vettori (es. PostgreSQL con `pgvector`).

**Self-hosting** — Esecuzione del software interamente su infrastruttura controllata dall'utente.

**Citazione verificabile** — Riferimento di una risposta a una fonte ufficiale identificabile (ELI + articolo + comma + data di vigenza).
