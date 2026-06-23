# AGENTS.md — Magistra

Istruzioni per chiunque (persone o agenti AI) scriva nella **knowledge base** del progetto.

La knowledge base vive in [`knowledge/`](knowledge/) ed è un bundle **[Open Knowledge Format (OKF) v0.1](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)**: una directory di file Markdown con frontmatter YAML, leggibile da persone e agenti senza alcun SDK o piattaforma proprietaria. Queste regole servono a mantenerla **uniforme**.

---

## 1. Principio fondamentale: un concetto, un file

- Ogni file descrive **un solo concetto** (una fonte, un'entità dati, un componente, un processo, un termine).
- Se un documento inizia a descrivere due cose distinte, **dividilo** in due file e collegali.
- Il nome del file è uno **slug kebab-case** del concetto, in italiano, senza accenti né spazi: `ricerca-semantica.md`, `uri-eli.md`.
- Ogni cartella ha un `index.md` che descrive l'area ed elenca i concetti che contiene. Quando aggiungi un file, **aggiungi la voce corrispondente nell'`index.md`** della cartella.

---

## 2. Frontmatter YAML (obbligatorio)

Ogni file `.md` del bundle inizia con un blocco frontmatter delimitato da `---`. Esempio:

```yaml
---
type: Fonte Dati
title: Normattiva — Open Data
description: Fonte primaria per la legislazione statale italiana, in formato Akoma Ntoso / ELI.
resource: https://dati.normattiva.it/
tags: [fonte-primaria, normattiva, eli]
timestamp: 2026-06-18T00:00:00Z
---
```

### Campi

| Campo | Obbligatorio | Formato | Note |
|---|---|---|---|
| `type` | **Sì** | Stringa | Unico campo richiesto da OKF. Usa **solo** i tipi del vocabolario qui sotto. |
| `title` | Consigliato | Stringa | Nome leggibile del concetto. Senza punto finale. |
| `description` | Consigliato | Stringa | Una frase che riassume il concetto. Senza punto finale opzionale, frase singola. |
| `resource` | Se esiste | URL | Link alla risorsa canonica esterna (portale, spec, repo). Una sola URL. |
| `tags` | Consigliato | Lista | kebab-case, in italiano, da 1 a 5 tag. Usa tag già esistenti quando possibile. |
| `timestamp` | Consigliato | ISO 8601 UTC | Data dell'ultimo aggiornamento sostanziale, es. `2026-06-18T00:00:00Z`. Aggiornalo quando modifichi il contenuto. |
| `version` | Solo radice | Stringa (SemVer) | Versione del bundle, **solo in `knowledge/index.md`**. È l'unica fonte di verità della versione: la build PDF (`npm run build:pdf`) la legge per la copertina e il nome del file. Incrementala quando pubblichi una nuova versione del documento. |

Regole:
- Non inventare campi nuovi nel frontmatter senza prima discuterne in una issue.
- I valori non vanno tra virgolette salvo che contengano `:` o caratteri speciali YAML.

---

## 3. Vocabolario di `type`

Usa **esclusivamente** questi valori (in italiano, con iniziali maiuscole):

| `type` | Quando usarlo | Cartella tipica |
|---|---|---|
| `Bundle di Conoscenza` | Solo la radice del bundle (`knowledge/index.md`). | radice |
| `Indice` | I file `index.md` di ogni cartella. | tutte |
| `Fonte Dati` | Una fonte normativa/giurisprudenziale. | `fonti/` |
| `Concetto` | Un concetto/modello (FRBR, ELI, struttura AKN…). | `modello-dati/` |
| `Entità Dati` | Un'entità dello schema dati interno. | `modello-dati/` |
| `Componente` | Un componente dell'architettura. | `architettura/` |
| `Processo` | Un flusso o pipeline (RAG, ingest…). | `architettura/`, `modello-dati/` |
| `Termine` | Una voce di glossario. | `glossario/` |

Se serve un nuovo `type`, proponilo in una issue prima di usarlo, così il vocabolario resta condiviso.

---

## 4. Corpo del documento

- Dopo il frontmatter, inizia con un titolo `# ` di primo livello che ripete il `title`.
- **Un solo `#`** per file; usa `##`/`###` per le sottosezioni.
- Stile **bozza/descrittivo**: lo stato attuale del progetto è concettuale, non un'implementazione. Se descrivi qualcosa di non ancora implementato, dichiaralo (es. "bozza concettuale").
- Tabelle per schemi di campi ed elenchi di formati; blocchi di codice recintati per markup (XML) e pattern (URI).
- **Diagrammi in [Mermaid](https://mermaid.js.org/)** (blocco ```` ```mermaid ````), non ASCII art: sono renderizzabili da GitHub e vengono inclusi come immagini nel PDF (`npm run build:pdf`). Mantieni le etichette brevi (usa `<br/>` per andare a capo).

---

## 5. Collegamenti tra concetti

- Collega **liberamente** i concetti correlati: è il valore principale del formato.
- Usa percorsi **relativi alla radice del bundle**, con `/` iniziale e l'estensione `.md`:
  - ✅ `[Norma](/modello-dati/norma.md)`
  - ✅ `[ELI](/glossario/eli.md)`
  - ❌ `[Norma](norma.md)` · ❌ `[ELI](../glossario/eli.md)` · ❌ link senza `.md`
- Quando citi un termine definito nel glossario, **linkalo** alla sua voce.
- I link a risorse esterne vanno nel corpo come link Markdown normali e, se sono la risorsa canonica del concetto, anche nel campo `resource`.

---

## 6. Lingua e stile

- **Tutto in italiano**: contenuti, `title`, `description`, `tags`, commenti.
- Terminologia coerente con il [glossario](knowledge/glossario/index.md): se un termine esiste lì, usalo nella stessa forma.
- Markdown: **una frase per riga** quando possibile, per diff più leggibili.
- Niente consulenza legale: i contenuti sono di supporto informativo.

---

## 7. Principi non negoziabili del contenuto

- **Citazioni verificabili**: nessuna affermazione normativa senza riferimento alla fonte ufficiale ([ELI](knowledge/glossario/eli.md) + articolo + comma + data di vigenza).
- **Rispetto delle licenze**: i dati si usano e ridistribuiscono solo nei termini consentiti (vedi [`knowledge/fonti/`](knowledge/fonti/index.md)).
- **Tracciabilità**: per ogni fonte conserva provenienza, formato originario e URI ELI.
- **Privacy**: non inserire dati personali o documenti riservati nel repository.

---

## 8. Validazione

Prima di aprire una PR, esegui il validatore della knowledge base:

```bash
npm test            # oppure: node scripts/validate-knowledge-base.mjs
```

Lo script verifica frontmatter, vocabolario di `type`, slug dei file, struttura delle cartelle, collegamenti interni e copertura negli `index.md`. Termina con codice ≠ 0 se trova errori (con `--strict` fallisce anche sui warning) ed è pensato per girare anche in CI.

---

Per il flusso di contribuzione (issue, branch, commit) vedi [`CONTRIBUTING.md`](CONTRIBUTING.md).

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **magistra** (632 symbols, 969 relationships, 40 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/magistra/context` | Codebase overview, check index freshness |
| `gitnexus://repo/magistra/clusters` | All functional areas |
| `gitnexus://repo/magistra/processes` | All execution flows |
| `gitnexus://repo/magistra/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
