# Modello dati e parsing Akoma Ntoso

Questo documento descrive come Italian-OSS-Legal-Platform rappresenta una norma italiana a partire dai dati di Normattiva (Akoma Ntoso / ELI) e come la trasforma in unità interrogabili per la ricerca semantica e le citazioni.

È una **bozza concettuale**: lo schema serve a ragionare sui dati, non è ancora un'implementazione.

---

## 1. Il modello FRBR di Akoma Ntoso

Akoma Ntoso adotta il modello **FRBR** per gestire le numerose derivazioni dei testi normativi (modifiche, versioni, lingue). Quattro livelli:

| Livello | Significato | Esempio |
|---|---|---|
| **Work** | La norma in astratto, in tutte le sue versioni | "L. 241/1990" |
| **Expression** | Una versione specifica nel tempo/lingua | "L. 241/1990 vigente al 2020-01-01" |
| **Manifestation** | Una rappresentazione in un formato | il file XML AKN di quella versione |
| **Item** | La copia concreta (file) | il file scaricato e archiviato |

Questi livelli sono dichiarati nel blocco `<meta>` → `<identification>` tramite `<FRBRWork>`, `<FRBRExpression>`, `<FRBRManifestation>`, `<FRBRItem>`.

Questo modello è il motivo per cui Italian-OSS-Legal-Platform può distinguere "il testo vigente oggi" da "il testo in vigore nel 2015".

---

## 2. Identificazione: URI ELI

Ogni norma è identificata da una **URI ELI** (European Legislation Identifier) permanente. Italian-OSS-Legal-Platform usa l'ELI come **chiave primaria stabile** per collegare versioni, citazioni e riferimenti incrociati.

Esempio concettuale di pattern ELI:

```
/eli/it/stato/legge/1990/08/07/241/...
```

Vantaggi: stabilità nel tempo, interoperabilità europea, deduplicazione affidabile.

---

## 3. Struttura del documento AKN

Un atto (`<act>`) si articola tipicamente in:

```
<akomaNtoso>
  <act>
    <meta> … identificazione FRBR, riferimenti, cicli di vita …
    <preface> … titolo, intestazione …
    <preamble> … premesse …
    <body>
      <article>          (unità di base: articolo)
        <num>            (numero articolo)
        <heading>        (rubrica)
        <paragraph>      (comma)
          <num>          (numero comma)
          <content>      (testo)
      …
    <conclusions> … formule finali …
```

L'**articolo** (`<article>`) è l'unità fondamentale; il **comma** (`<paragraph>`) è la sotto-unità più rilevante per le citazioni puntuali.

---

## 4. Modello dati interno di Italian-OSS-Legal-Platform (bozza)

Astratto dai formati di origine, indipendente dal database scelto.

### Entità `Norma` (Work)
| Campo | Descrizione |
|---|---|
| `eli` | URI ELI (chiave primaria) |
| `tipo_atto` | legge, decreto legge, d.lgs., codice, … |
| `numero` | numero dell'atto |
| `data` | data dell'atto |
| `titolo` | titolo / oggetto |
| `fonte` | provenienza (es. Normattiva) |

### Entità `Versione` (Expression)
| Campo | Descrizione |
|---|---|
| `id` | identificativo versione |
| `eli` | riferimento alla Norma |
| `vigenza_da` / `vigenza_a` | intervallo di vigenza |
| `stato` | vigente / abrogata / originaria |

### Entità `Unita` (articolo/comma)
| Campo | Descrizione |
|---|---|
| `id` | identificativo unità |
| `versione_id` | riferimento alla Versione |
| `tipo` | articolo / comma / lettera |
| `numero` | es. "art. 3, comma 2" |
| `percorso` | path gerarchico nel documento |
| `testo` | testo pulito dell'unità |
| `eli_unita` | URI ELI a livello di articolo (se disponibile) |

### Entità `Chunk` (per la ricerca semantica)
| Campo | Descrizione |
|---|---|
| `id` | identificativo chunk |
| `unita_id` | unità di origine |
| `testo` | porzione di testo |
| `embedding` | vettore per la ricerca semantica |
| `metadati` | eli, articolo, comma, vigenza → per la **citazione** |

### Entità `Riferimento` (cross-reference)
| Campo | Descrizione |
|---|---|
| `da_eli` | norma/unità citante |
| `a_eli` | norma/unità citata |
| `tipo` | rinvio, modifica, abrogazione, recepimento UE |

---

## 5. Pipeline di trasformazione

```
Normattiva (API)
   │  download AKN + metadati ELI
   ▼
Parsing AKN  ──►  estrazione struttura (Work/Expression/Unità)
   │
   ▼
Normalizzazione testo  (preservando i riferimenti)
   │
   ▼
Chunking per unità  (articolo/comma, con metadati di citazione)
   │
   ▼
Embedding  ──►  indice vettoriale
   │
   ▼
Estrazione riferimenti  ──►  grafo delle norme
```

**Principio chiave**: ogni `Chunk` porta con sé i metadati necessari a costruire una **citazione verificabile** (ELI + articolo + comma + data di vigenza). Senza questi metadati il chunk non entra nell'indice.
