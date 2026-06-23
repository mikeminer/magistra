create extension if not exists vector;

create table if not exists schema_migrations (
  id text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists norme (
  eli text primary key,
  tipo_atto text not null,
  numero text not null,
  data_atto date not null,
  titolo text not null,
  fonte text not null,
  created_at timestamptz not null default now()
);

create table if not exists artefatti_fonte (
  id text primary key,
  fonte text not null,
  formato text not null,
  sha256 text not null,
  url_fonte text not null,
  dimensione_byte integer not null,
  acquisito_il timestamptz not null default now()
);

create table if not exists versioni (
  id text primary key,
  norma_eli text not null references norme(eli) on delete cascade,
  vigenza_da date not null,
  vigenza_a date,
  stato text not null,
  created_at timestamptz not null default now()
);

create table if not exists manifestazioni (
  id text primary key,
  versione_id text not null references versioni(id) on delete cascade,
  formato text not null,
  url_fonte text not null,
  sha256 text not null,
  created_at timestamptz not null default now()
);

create table if not exists items_fonte (
  id text primary key,
  manifestazione_id text not null references manifestazioni(id) on delete cascade,
  storage_uri text,
  dimensione_byte integer not null,
  acquisito_il timestamptz not null default now()
);

create table if not exists unita_normative (
  id text primary key,
  versione_id text not null references versioni(id) on delete cascade,
  tipo text not null,
  numero text not null,
  percorso text not null,
  testo text not null,
  eli_unita text,
  created_at timestamptz not null default now()
);

create table if not exists chunk_normativi (
  id text primary key,
  unita_id text not null references unita_normative(id) on delete cascade,
  artefatto_fonte_id text references artefatti_fonte(id) on delete set null,
  testo text not null,
  embedding vector(1536),
  citation_eli text not null,
  citation_fonte text not null,
  citation_tipo_atto text not null,
  citation_numero_atto text not null,
  citation_data_atto date not null,
  citation_articolo text not null,
  citation_comma text,
  citation_vigenza_da date not null,
  citation_vigenza_a date,
  citation_url_fonte text,
  created_at timestamptz not null default now()
);

create table if not exists riferimenti_normativi (
  da_eli text not null,
  a_eli text not null,
  tipo text not null,
  created_at timestamptz not null default now(),
  fonte_estrazione text not null,
  testo_match text,
  confidenza double precision not null,
  stato_risoluzione text not null,
  target_risolto boolean not null default false,
  target_fonte text,
  target_titolo text,
  target_url_fonte text,
  aggiornato_il timestamptz not null default now(),
  primary key (da_eli, a_eli, tipo)
);

create table if not exists ingest_jobs (
  id text primary key,
  fonte text not null,
  stato text not null,
  iniziato_il timestamptz not null default now(),
  completato_il timestamptz,
  errore text,
  conteggi jsonb not null default '{}'::jsonb,
  dettagli jsonb not null default '{}'::jsonb
);

create table if not exists source_catalog (
  id text primary key,
  fonte text not null,
  tipo text not null,
  url text not null,
  licenza text not null,
  riuso text not null,
  stato text not null,
  dettagli jsonb not null default '{}'::jsonb,
  aggiornata_il timestamptz not null default now()
);

create table if not exists source_runs (
  id text primary key,
  job_id text not null,
  fonte text not null,
  url_fonte text not null,
  stato text not null,
  dettagli jsonb not null default '{}'::jsonb,
  acquisito_il timestamptz not null default now()
);

create table if not exists source_policy_approvals (
  id text primary key,
  fonte_id text not null unique,
  stato text not null,
  approvata_da text,
  evidenza_url text,
  nota text,
  aggiornata_il timestamptz not null default now()
);

create table if not exists review_queue (
  id text primary key,
  domanda text not null,
  risposta text not null,
  stato text not null,
  rischio text not null,
  motivo text,
  payload jsonb not null default '{}'::jsonb,
  assegnata_a text,
  decisione text,
  priorita text not null default 'normale',
  scadenza_il timestamptz,
  creata_il timestamptz not null default now(),
  aggiornata_il timestamptz not null default now()
);

create table if not exists review_eventi (
  id text primary key,
  review_id text not null references review_queue(id) on delete cascade,
  operatore text not null,
  stato_da text,
  stato_a text not null,
  nota text,
  creato_il timestamptz not null default now()
);

create table if not exists documenti_utente (
  id text primary key,
  nome_file text not null,
  content_type text not null,
  storage_uri text not null,
  dimensione_byte integer not null,
  sha256 text not null,
  stato text not null,
  anteprima_testo text,
  caricato_da text,
  caricato_il timestamptz not null default now()
);

create index if not exists idx_chunk_normativi_citation
  on chunk_normativi (citation_fonte, citation_tipo_atto, citation_numero_atto, citation_articolo);

create index if not exists idx_chunk_normativi_artifact
  on chunk_normativi (artefatto_fonte_id);

create index if not exists idx_riferimenti_normativi_target
  on riferimenti_normativi (target_risolto, tipo, a_eli);

create index if not exists idx_source_runs_fonte
  on source_runs (fonte, stato, acquisito_il desc);
