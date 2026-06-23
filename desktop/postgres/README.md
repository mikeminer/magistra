# Portable PostgreSQL runtime

This directory is optional. The standard OSS desktop build uses PGlite and does not require PostgreSQL or Docker.

Place a Windows x64 PostgreSQL runtime with `pgvector` here only if you want to build the alternative portable-Postgres mode.

Expected layout:

```text
desktop/postgres/bin/pg_ctl.exe
desktop/postgres/bin/initdb.exe
desktop/postgres/bin/createdb.exe
desktop/postgres/bin/psql.exe
```

The desktop app copies this directory into `resources/magistra-runtime/postgres`. It is used when `MAGISTRA_DESKTOP_DB_MODE=portable-postgres` or as a fallback if PGlite bootstrap is unavailable.

Do not commit the PostgreSQL binaries to Git.
