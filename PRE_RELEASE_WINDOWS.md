# Magistra per Windows - Pre-release

Magistra e' una app desktop per Windows che porta l'MVP della piattaforma Magistra in una finestra nativa. L'app avvia localmente il servizio web incluso nell'installer, prepara il database locale quando disponibile e apre l'interfaccia di chat, ricerca normativa e consultazione delle fonti.

Questa pre-release e' pensata per test tecnici, demo controllate e raccolta feedback. Non e' ancora una versione stabile di produzione.

## Download

- Installer Windows: `Magistra-Setup-0.1.0.exe`
- Architettura: Windows x64
- Tipo installer: NSIS, installazione guidata con scelta cartella, collegamento Start Menu e collegamento desktop.

## Requisiti di sistema

### Requisiti minimi

- Windows 10 o Windows 11 a 64 bit.
- CPU x64 moderna.
- 8 GB di RAM.
- 1 GB di spazio libero su disco per installazione, cache locale, snapshot normativo e log.
- Connessione internet per importare fonti normative online da Normattiva quando non sono presenti nel database locale.

### Requisiti consigliati

- Windows 11 a 64 bit.
- 16 GB di RAM.
- SSD con almeno 2 GB liberi.
- Runtime PostgreSQL locale con `pgvector` incluso nell'installer o disponibile sul sistema.
- Ollama installato e raggiungibile su `http://127.0.0.1:11434`.
- Modello locale `llama3.2:latest` disponibile in Ollama, oppure configurazione LLM equivalente.

### Componenti esterni per l'esperienza completa

L'installer include l'app desktop, la build web di Magistra, lo schema database e lo slot per un corpus pre-ingestato. La modalita' completa RAG locale richiede:

- un database PostgreSQL/pgvector locale, portabile o esterno;
- uno snapshot del corpus pre-ingestato incluso in `resources/magistra-runtime/snapshots`;
- un provider LLM locale o compatibile;
- accesso internet per recuperare fonti online mancanti.

Se `DATABASE_URL` non e' configurato, la desktop app prova ad avviare un runtime PostgreSQL portabile incluso nel bundle. Se il runtime portabile non e' presente, prova a rilevare il container Docker `italian-oss-legal-platform-postgres-1` come fallback tecnico. Se nessun database e' disponibile, alcune funzioni possono lavorare in modalita' ridotta o non trovare fonti sufficienti. Se il modello LLM non e' raggiungibile, la generazione della risposta puo' fallire.

## Feature incluse

- App desktop Windows con finestra dedicata per Magistra.
- Avvio automatico del servizio locale incluso nell'app.
- Bootstrap database locale con schema PostgreSQL/pgvector.
- Restore automatico dello snapshot `magistra-corpus.sql` quando presente nel bundle.
- Worker separato per bootstrap, job schedulati e recupero online incrementale, senza bloccare il processo API/chat.
- Chat legale con risposte basate sulle fonti recuperate.
- Citazioni verificabili con riferimento a fonte, articolo e comma quando disponibili.
- Ricerca sul database locale prima di qualunque recupero online.
- Fallback online: quando il database locale non trova fonti, il sistema prova a importare fonti da Normattiva, le salva localmente e rilancia la ricerca.
- Sintesi LLM: la risposta finale viene generata dal modello LLM usando i testi delle fonti trovate o importate.
- Supporto a fonti Normattiva con URL/URN ufficiali.
- Supporto a riferimenti normativi collegati e riferimenti incrociati quando presenti nell'indice.
- Log locali dell'app desktop per diagnosi di avvio e runtime.

## Come funziona

1. L'utente avvia Magistra dal collegamento desktop o Start Menu.
2. L'app desktop apre una finestra Windows.
3. Se non e' gia' configurato un database, l'app prova ad avviare PostgreSQL portabile dal bundle.
4. Il database viene inizializzato con `schema.sql` e, se presente, con lo snapshot `magistra-corpus.sql`.
5. Se il database locale e' vuoto e non c'e' snapshot, un worker separato puo' eseguire un bootstrap iniziale.
6. In background viene avviato il servizio web locale su una porta libera di `127.0.0.1`.
7. La chat interroga prima il database locale.
8. Se non trova fonti sufficienti, l'API invoca il worker per il recupero online da Normattiva.
9. Le fonti recuperate vengono importate e indicizzate dal worker.
10. Il sistema rilancia la ricerca sulle fonti disponibili.
11. Il LLM genera un sunto citando le fonti usate.

## Creare il corpus snapshot per la release

Da un database gia' popolato:

```powershell
node desktop/create-corpus-snapshot.cjs
```

Lo script crea:

- `desktop/snapshots/magistra-corpus.sql`
- `desktop/snapshots/magistra-corpus.manifest.json`

Se `pg_dump` non e' disponibile sul sistema ma il container PostgreSQL del progetto e' attivo, lo script usa automaticamente `docker exec pg_dump`. I file snapshot sono artefatti locali ignorati da Git, ma inclusi dall'installer se presenti durante la build.

## Note importanti della pre-release

- L'installer non e' ancora firmato digitalmente: Windows SmartScreen potrebbe mostrare un avviso.
- Magistra e' uno strumento informativo: non fornisce consulenza legale e non sostituisce un professionista abilitato.
- La qualita' delle risposte dipende dalle fonti presenti nel database, dalla riuscita dell'import online e dal modello LLM configurato.
- Le funzionalita' di import online richiedono connettivita' verso le fonti ufficiali.
- Per un installer completamente autonomo bisogna includere in `desktop/postgres/` un runtime PostgreSQL Windows x64 con `pgvector` prima della build.
- La configurazione locale del database e del modello puo' variare tra ambienti di test.

## Troubleshooting rapido

- Se l'app si apre ma non risponde: verificare che non ci siano firewall o antivirus che bloccano il servizio locale su `127.0.0.1`.
- Se le risposte LLM falliscono: verificare che Ollama sia avviato e che `http://127.0.0.1:11434/v1` sia raggiungibile.
- Se non vengono trovate fonti: verificare che PostgreSQL/pgvector sia attivo, che lo snapshot sia stato ripristinato e che il database locale sia popolato.
- Se l'import online fallisce: verificare la connessione internet e la raggiungibilita' di Normattiva.
- I log desktop si trovano in `%APPDATA%\magistra-desktop\logs`.

## Stato della release

Questa e' una pre-release Windows dell'MVP. L'obiettivo e' validare installazione, avvio desktop, ricerca locale, recupero fonti online e generazione LLM con citazioni.
