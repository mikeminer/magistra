# Corpus snapshots

Put a pre-ingested PostgreSQL snapshot here before building the Windows installer.

Expected default files:

- `magistra-corpus.sql`
- `magistra-corpus.manifest.json`

Create them from a populated database with:

```powershell
node desktop/create-corpus-snapshot.cjs
```

The snapshot files are local release artifacts and are intentionally ignored by Git.
