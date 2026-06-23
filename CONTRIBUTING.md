# Contributing

Magistra OSS is TypeScript-first. New application code should live in `src/` and compile to `dist/` for the current Windows pre-release runtime.

## Runtime Boundaries

- `packages/backend`: realtime API, retrieval orchestration and LLM answer generation.
- `packages/worker`: batch jobs, ingest, online source import, chunking and embeddings.
- `desktop`: Electron shell, local runtime bootstrap, database snapshot restore and installer config.

The API must not run full corpus ingest or heavy online import work in-process. It may plan work and invoke/queue the worker, then retry retrieval from the local database.

## Local Checks

```powershell
npm run check
```

Useful focused commands:

```powershell
npm run kb:validate
npm run check:runtime
npm run snapshot:create
npm run desktop:dist
```

## Current Source Layout

The repository still contains committed `dist/` artifacts because the Windows pre-release consumes them directly. When touching runtime behavior, update the relevant `src/` source file where present and keep the matching `dist/` runtime in sync until the full build pipeline is restored.
