#!/usr/bin/env node
// Validatore della knowledge base OKF di Magistra.
//
// Verifica che il bundle in `knowledge/` rispetti le regole di AGENTS.md:
// frontmatter YAML, vocabolario di `type`, slug dei file, struttura delle
// cartelle, collegamenti interni e copertura negli `index.md`.
//
// Uso:
//   node scripts/validate-knowledge-base.mjs [--strict] [--root <dir>]
//
// Uscita: 0 se valido, 1 se ci sono errori (o warning con --strict).
// Nessuna dipendenza esterna: gira con Node puro.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- Configurazione (allineata ad AGENTS.md) -------------------------------

// Vocabolario chiuso dei `type` ammessi.
const TYPES = new Set([
  'Bundle di Conoscenza',
  'Indice',
  'Fonte Dati',
  'Concetto',
  'Entità Dati',
  'Componente',
  'Processo',
  'Termine',
]);

const ROOT_TYPE = 'Bundle di Conoscenza'; // solo knowledge/index.md
const INDEX_TYPE = 'Indice'; // tutti gli altri index.md

const RECOMMENDED_FIELDS = ['title', 'description', 'tags', 'timestamp'];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; // kebab-case, niente accenti/spazi
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const MAX_TAGS = 5;

// --- Parsing argomenti ------------------------------------------------------

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const rootArgIdx = args.indexOf('--root');
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const bundleRoot =
  rootArgIdx !== -1 && args[rootArgIdx + 1]
    ? path.resolve(args[rootArgIdx + 1])
    : path.join(repoRoot, 'knowledge');

// --- Raccolta problemi ------------------------------------------------------

const problems = []; // { level: 'error'|'warn', file, line, msg }

function err(file, msg, line) {
  problems.push({ level: 'error', file, msg, line });
}
function warn(file, msg, line) {
  problems.push({ level: 'warn', file, msg, line });
}

// --- Utility ----------------------------------------------------------------

/** Elenca ricorsivamente i file .md sotto `dir`, ignorando i file/cartelle nascosti. */
function listMarkdown(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue; // ignora dotfile/dotdir (es. .obsidian)
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

/** Elenca ricorsivamente le directory sotto `dir`, includendo `dir` e ignorando quelle nascoste. */
function listDirs(dir) {
  const out = [dir];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue; // ignora dotdir (es. .obsidian)
    if (entry.isDirectory()) out.push(...listDirs(path.join(dir, entry.name)));
  }
  return out;
}

/** Percorso interno al bundle, con `/` iniziale e separatori POSIX. */
function bundlePath(absFile) {
  const rel = path.relative(bundleRoot, absFile).split(path.sep).join('/');
  return '/' + rel;
}

/**
 * Parser minimale del frontmatter YAML (flat, scalari + array inline).
 * Ritorna { data, fieldLines, bodyStartLine } oppure null se assente/malformato.
 */
function parseFrontmatter(content, file) {
  const lines = content.split('\n');
  if (lines[0].trim() !== '---') {
    err(file, 'Frontmatter assente: il file deve iniziare con una riga "---".', 1);
    return null;
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) {
    err(file, 'Frontmatter non terminato: manca la riga "---" di chiusura.', 1);
    return null;
  }

  const data = {};
  const fieldLines = {};
  for (let i = 1; i < end; i++) {
    const raw = lines[i];
    if (raw.trim() === '' || raw.trimStart().startsWith('#')) continue;
    const colon = raw.indexOf(':');
    if (colon === -1) {
      err(file, `Riga di frontmatter non valida (manca ":"): "${raw.trim()}"`, i + 1);
      continue;
    }
    const key = raw.slice(0, colon).trim();
    let value = raw.slice(colon + 1).trim();
    fieldLines[key] = i + 1;

    if (value.startsWith('[') && value.endsWith(']')) {
      // array inline: [a, b, c]
      const inner = value.slice(1, -1).trim();
      data[key] = inner === '' ? [] : inner.split(',').map((s) => unquote(s.trim()));
    } else {
      data[key] = unquote(value);
    }
  }
  return { data, fieldLines, bodyStartLine: end + 2, lines };
}

function unquote(s) {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

/** Estrae i target dei link Markdown [testo](target), ignorando le immagini. */
function extractLinks(content) {
  const links = [];
  const re = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    links.push(m[1]);
  }
  return links;
}

// --- Validazione di un singolo file ----------------------------------------

function validateFile(file, knownFiles) {
  const content = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const bp = bundlePath(file);
  const base = path.basename(file);
  const isIndex = base === 'index.md';
  const isRootIndex = bp === '/index.md';

  // 1. Slug del nome file (i non-index devono essere kebab-case)
  if (!isIndex) {
    const slug = base.replace(/\.md$/, '');
    if (!SLUG_RE.test(slug)) {
      err(file, `Nome file non valido: "${base}". Usa uno slug kebab-case in minuscolo, senza accenti né spazi.`);
    }
  }

  // 2. Frontmatter
  const fm = parseFrontmatter(content, file);
  if (!fm) return;
  const { data, fieldLines } = fm;

  // 3. type obbligatorio + vocabolario + posizione
  if (!('type' in data)) {
    err(file, 'Campo obbligatorio "type" mancante nel frontmatter.', 1);
  } else {
    const t = data.type;
    if (!TYPES.has(t)) {
      err(file, `type "${t}" non ammesso. Valori validi: ${[...TYPES].join(', ')}.`, fieldLines.type);
    }
    if (isRootIndex && t !== ROOT_TYPE) {
      err(file, `La radice del bundle deve avere type "${ROOT_TYPE}" (trovato "${t}").`, fieldLines.type);
    } else if (isIndex && !isRootIndex && t !== INDEX_TYPE) {
      err(file, `Gli index.md devono avere type "${INDEX_TYPE}" (trovato "${t}").`, fieldLines.type);
    } else if (!isIndex && (t === INDEX_TYPE || t === ROOT_TYPE)) {
      err(file, `type "${t}" è riservato agli index.md / alla radice, non a un concetto.`, fieldLines.type);
    }
  }

  // 4. Campi consigliati
  for (const f of RECOMMENDED_FIELDS) {
    if (!(f in data)) warn(file, `Campo consigliato "${f}" assente.`, 1);
  }

  // 5. title: niente punto finale
  if (typeof data.title === 'string' && data.title.trim().endsWith('.')) {
    warn(file, 'Il "title" non dovrebbe terminare con un punto.', fieldLines.title);
  }

  // 6. tags: lista kebab-case, 1..MAX_TAGS
  if ('tags' in data) {
    if (!Array.isArray(data.tags)) {
      err(file, 'Il campo "tags" deve essere una lista inline, es. [a, b].', fieldLines.tags);
    } else {
      if (data.tags.length === 0 || data.tags.length > MAX_TAGS) {
        err(file, `"tags" deve contenere da 1 a ${MAX_TAGS} voci (trovate ${data.tags.length}).`, fieldLines.tags);
      }
      for (const tag of data.tags) {
        if (!SLUG_RE.test(tag)) {
          err(file, `tag non valido: "${tag}". Usa kebab-case minuscolo.`, fieldLines.tags);
        }
      }
    }
  }

  // 7. timestamp: ISO 8601 UTC valido
  if ('timestamp' in data) {
    const ts = data.timestamp;
    if (!ISO_UTC_RE.test(ts) || Number.isNaN(Date.parse(ts))) {
      err(file, `"timestamp" non è ISO 8601 UTC valido (atteso es. 2026-06-18T00:00:00Z): "${ts}".`, fieldLines.timestamp);
    }
  }

  // 8. resource: singola URL http(s)
  if ('resource' in data) {
    const r = data.resource;
    let ok = false;
    try {
      const u = new URL(r);
      ok = u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      ok = false;
    }
    if (!ok) err(file, `"resource" deve essere una singola URL http(s) valida: "${r}".`, fieldLines.resource);
  }

  // 9. Corpo: esattamente un titolo H1
  const h1s = [];
  fm.lines.forEach((l, i) => {
    if (/^#\s+\S/.test(l)) h1s.push(i + 1);
  });
  if (h1s.length === 0) err(file, 'Manca un titolo di primo livello "# ".');
  else if (h1s.length > 1) err(file, `Sono presenti ${h1s.length} titoli "# " (atteso 1), alle righe ${h1s.join(', ')}.`);

  // 10. Link interni
  for (const target of extractLinks(content)) {
    if (/(^|\/)docs\//.test(target)) {
      err(file, `Link alla vecchia cartella docs/: "${target}". Usa la knowledge base in /…`);
      continue;
    }
    const clean = target.split('#')[0];
    if (clean === '' || /^[a-z]+:/i.test(clean) || clean.startsWith('//')) continue; // ancore / URL esterne
    if (!clean.endsWith('.md')) continue; // link non al bundle
    if (!clean.startsWith('/')) {
      err(file, `Link interno non root-relative: "${target}". Usa percorsi tipo /cartella/file.md.`);
      continue;
    }
    if (!knownFiles.has(clean)) {
      err(file, `Link interno non risolto: "${target}" non corrisponde a nessun file del bundle.`);
    }
  }

  return { bundlePath: bp, isIndex, isRootIndex };
}

// --- Esecuzione -------------------------------------------------------------

function main() {
  if (!fs.existsSync(bundleRoot) || !fs.statSync(bundleRoot).isDirectory()) {
    console.error(`✗ Cartella della knowledge base non trovata: ${bundleRoot}`);
    process.exit(1);
  }

  const files = listMarkdown(bundleRoot).sort();
  const knownFiles = new Set(files.map(bundlePath));

  // a. Ogni cartella deve avere un index.md
  for (const dir of listDirs(bundleRoot)) {
    if (!fs.existsSync(path.join(dir, 'index.md'))) {
      const rel = path.relative(bundleRoot, dir).split(path.sep).join('/') || '(radice)';
      err(path.join(dir, 'index.md'), `La cartella "${rel}" non contiene un index.md.`);
    }
  }

  // b. Validazione per-file + raccolta del contenuto degli index
  const indexContent = new Map(); // dir assoluta -> testo dell'index.md
  for (const file of files) {
    validateFile(file, knownFiles);
    if (path.basename(file) === 'index.md') {
      indexContent.set(path.dirname(file), fs.readFileSync(file, 'utf8'));
    }
  }

  // c. Copertura negli index.md (tranne la radice del bundle):
  //    - un concetto dev'essere linkato dall'index.md della sua cartella;
  //    - l'index.md di una sottocartella dev'essere linkato dall'index.md
  //      della cartella padre.
  for (const file of files) {
    const bp = bundlePath(file);
    if (bp === '/index.md') continue;
    const isIndex = path.basename(file) === 'index.md';
    const referencingDir = isIndex
      ? path.dirname(path.dirname(file)) // index di sottocartella → cartella padre
      : path.dirname(file); // concetto → propria cartella
    const idx = indexContent.get(referencingDir);
    if (idx === undefined) continue; // già segnalato come index mancante
    if (!idx.includes(bp)) {
      const where = (path.relative(bundleRoot, referencingDir).split(path.sep).join('/') || '') + '/index.md';
      err(file, `Non è referenziato in "/${where}" (atteso un link a "${bp}").`);
    }
  }

  // --- Report ---------------------------------------------------------------

  const errors = problems.filter((p) => p.level === 'error');
  const warnings = problems.filter((p) => p.level === 'warn');

  const fmt = (p) => {
    const loc = bundlePath(p.file) + (p.line ? `:${p.line}` : '');
    const tag = p.level === 'error' ? 'ERRORE' : 'WARN  ';
    return `  ${tag}  ${loc}\n          ${p.msg}`;
  };

  problems
    .sort((a, b) => bundlePath(a.file).localeCompare(bundlePath(b.file)))
    .forEach((p) => console.log(fmt(p)));

  console.log('');
  console.log(`Knowledge base: ${bundleRoot}`);
  console.log(`File analizzati: ${files.length}`);
  console.log(`Errori: ${errors.length}   Warning: ${warnings.length}`);

  if (errors.length > 0 || (strict && warnings.length > 0)) {
    console.log('\n✗ Validazione fallita.');
    process.exit(1);
  }
  console.log('\n✓ Knowledge base valida.');
  process.exit(0);
}

main();
