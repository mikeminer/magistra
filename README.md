# Magistra

> Assistente legale open source, TypeScript-first, con fonti verificabili e distribuzione desktop Windows.

L'obiettivo è offrire un assistente legale AI con chat, ricerca normativa e analisi documentale, interamente fondato su fonti del diritto italiano e con citazioni verificabili.

Magistra nasce per essere usabile subito da studi legali, praticanti, uffici legali e contributor open source: una web app moderna per lo sviluppo e una desktop app Windows per chi non vuole installare Docker, database o LLM a mano.

Questo prodotto è ideato, gestito e costruito dalla community **[Italian Builders](https://italianbuilders.co)** — trovaci su [X (@italianbldrs)](https://x.com/italianbldrs) e su [italianbuilders.co](https://italianbuilders.co).

⚠️ **Disclaimer**: Magistra è uno strumento di supporto informativo. Non fornisce consulenza legale e non sostituisce il parere di un avvocato o di un professionista abilitato.

---

## Visione

Rendere il diritto italiano più accessibile e navigabile attraverso un assistente AI affidabile, trasparente e open source, che cita sempre le fonti e non "inventa" norme.

I principi guida sono tre:

- **Citazioni sempre verificabili**: ogni risposta rimanda all'articolo, al comma e alla fonte ufficiale (URI ELI / Normattiva).
- **Trasparenza**: codice, prompt e pipeline di dati sono aperti e ispezionabili.
- **Privacy by design**: i documenti dell'utente restano sotto il suo controllo; possibilità di esecuzione self-hosted.

---

## Funzionalità principali

- **Chat legale con citazioni**: domande in linguaggio naturale con risposte ancorate alle fonti normative.
- **Retrieval locale-first**: il sistema interroga prima il database locale; se non trova fonti sufficienti, recupera fonti online, le importa e ripete la ricerca.
- **Ricerca per concetto e fattispecie**: recupero per tema giuridico, scenario o descrizione fattuale, non solo per numero di articolo.
- **Analisi documenti**: caricamento di contratti, atti e PDF per riassunti, individuazione di clausole e verifica di riferimenti normativi.
- **Confronto versioni**: navigazione del testo vigente e delle versioni storiche di una norma (multivigenza).
- **Riferimenti incrociati**: collegamenti automatici tra norme citate, codici e normativa UE collegata.
- **Inferenza locale desktop**: la pre-release Windows include runtime Iurexa e modello GGUF leggero, senza richiedere Ollama o un LLM già installato.

---

## Desktop Windows

La distribuzione desktop OSS è pensata per l'avvocato medio: installazione guidata, avvio locale e uso immediato.

- Installer Windows NSIS x64.
- Database locale **PGlite** di default.
- Runtime LLM locale **Iurexa** incluso nel pacchetto.
- Modello leggero `iurexa-lite.gguf` incluso durante la build dell'installer.
- Collegamento Start Menu automatico e opzione per collegamento desktop.
- Nessun Docker richiesto per l'uso desktop standard.

Per creare l'installer:

```powershell
npm --prefix desktop run dist:win
```

Il comando prepara automaticamente il bundle Iurexa da:

- runtime: `C:\Users\mikfo\Documents\IRONMIND\build-ik\Release`
- modello: `C:\Users\mikfo\Documents\IRONMIND\models\iurexa-lite-IQ4_XS.gguf`

Il risultato viene generato in `artifacts/installer/`.

---

## Fonti dei dati

Il progetto si fonda su fonti ufficiali e aperte:

- **[Normattiva Open Data](https://dati.normattiva.it/)** — leggi, decreti e atti in formato **Akoma Ntoso (LegalDOCML)**, **JSON** e **HTML**, con identificatori **ELI (European Legislation Identifier)** e API ufficiali.
- **Gazzetta Ufficiale** — pubblicazione degli atti.
- **EUR-Lex** — normativa dell'Unione Europea collegata.
- **Giurisprudenza** — sentenze di Corte Costituzionale e Corte di Cassazione (ove disponibili in formato aperto).

---

## Architettura

Magistra adotta uno stack applicativo **TypeScript-first** per ridurre la barriera d'ingresso ai contributor e semplificare la futura distribuzione desktop.

- **Frontend**: Next.js / React / TypeScript.
- **Backend**: API TypeScript per chat, retrieval, import incrementale e analisi documentale.
- **Worker**: runtime separato per job di ingest, refresh fonti, import e indicizzazione.
- **Database desktop**: PGlite embedded.
- **Database managed/self-hosted**: PostgreSQL, con supporto a deployment più strutturati.
- **RAG**: database locale → recupero online incrementale → import → nuovo retrieval → sintesi LLM dalle fonti citate.
- **LLM desktop**: Iurexa locale, esposto come endpoint OpenAI-compatible.
- **LLM managed**: provider compatibili configurabili via ambiente.

```
Utente -> Frontend Next.js
          -> API TypeScript
          -> Database locale PGlite / Postgres
          -> Recupero online fonti ufficiali
          -> Import e indicizzazione
          -> LLM locale Iurexa
          -> Risposta sintetica con fonti citate
```

L'API non deve eseguire ingest completo del corpus, parsing pesante o reindicizzazioni estese nel processo realtime: queste operazioni appartengono al worker/job runtime.

---

## Flusso RAG

1. La domanda viene analizzata e trasformata in query giuridiche.
2. Il database locale è sempre la prima fonte.
3. Se le fonti locali non sono sufficienti, il sistema recupera fonti online ufficiali o pubbliche.
4. Le fonti trovate vengono importate e persistite.
5. Il retrieval viene ripetuto sul database locale aggiornato.
6. Il LLM produce un sunto solo a partire dalle fonti recuperate e citate.

Magistra non dovrebbe rispondere direttamente da risultati web non importati, non persistiti o non verificabili.

---

## Contribuire

Il progetto è agli inizi e i contributi sono benvenuti: pipeline dati, parsing Akoma Ntoso, frontend, desktop packaging, valutazione della qualità delle risposte, documentazione e connector per fonti pubbliche.

1. Apri una *issue* per proposte o bug.
2. Per modifiche, apri una *pull request* con descrizione chiara.
3. Le linee guida dettagliate (`CONTRIBUTING.md`) saranno aggiunte a breve.

---

## Documentazione

La knowledge base del progetto è in [`knowledge/`](knowledge/), strutturata come bundle **[Open Knowledge Format (OKF) v0.1](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)**: una directory di file Markdown con frontmatter YAML, dove ogni concetto (fonte, entità, componente, termine) è un documento autonomo e collegabile, leggibile sia da persone sia da agenti AI.

- [Fonti dei dati](knowledge/fonti/index.md) — fonti normative, formati e condizioni di riuso.
- [Modello dati e parsing Akoma Ntoso](knowledge/modello-dati/index.md) — FRBR, ELI, schema interno e pipeline.
- [Architettura](knowledge/architettura/index.md) — componenti e flusso RAG.
- [Glossario](knowledge/glossario/index.md) — termini giuridici e tecnici.

### Aprire la knowledge base in Obsidian

La cartella [`knowledge/`](knowledge/) è anche un **vault [Obsidian](https://obsidian.md/)**: aprila come vault per esplorare i concetti e i loro collegamenti nella vista a grafo. La configurazione del vault è versionata in `knowledge/.obsidian/`, così chiunque cloni il repository ottiene la **stessa configurazione** (plugin, aspetto, impostazioni del grafo) senza doverla ricreare.

Per contribuire: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Community

Magistra è un progetto **interamente ideato, gestito e costruito dalla community Italian Builders**, un collettivo di builder italiani che realizza prodotti open source.

- **Sito**: [italianbuilders.co](https://italianbuilders.co)
- **X / Twitter**: [@italianbldrs](https://x.com/italianbldrs)

Se vuoi contribuire o entrare in contatto con la community, parti da qui.

---

## Licenza

Da definire. Si propone **AGPL-3.0** per garantire che le derivazioni restino aperte.

---

*Magistra è in pre-release: funzionalità, architettura e packaging possono cambiare rapidamente mentre il prodotto viene validato con professionisti del settore legale.*
