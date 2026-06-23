# Portable PostgreSQL runtime

Place a Windows x64 PostgreSQL runtime with `pgvector` here before building a fully self-contained installer.

Expected layout:

```text
desktop/postgres/bin/pg_ctl.exe
desktop/postgres/bin/initdb.exe
desktop/postgres/bin/createdb.exe
desktop/postgres/bin/psql.exe
```

The desktop app copies this directory into `resources/magistra-runtime/postgres` and uses it to create a local user-data database when `DATABASE_URL` is not configured.

Do not commit the PostgreSQL binaries to Git.
