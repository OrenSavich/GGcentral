# ADR 0003: Prisma 7 owned by the API

## Status

Accepted

## Context

Only the API reads and writes PostgreSQL. The web app is a client of the HTTP API. Prisma ORM 8 is still a release candidate, and installing `prisma` without a version currently selects that candidate. Prisma 8 does not use the Prisma 7 schema workflow.

## Decision

Pin `prisma` and `@prisma/client` to 7.10.0. Keep `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations`, and `apps/api/prisma7.config.ts` inside the API. The client is generated to `apps/api/src/generated/prisma` and is not committed. Use the PostgreSQL driver adapter `@prisma/adapter-pg`.

Do not put Prisma in a shared database package. Revisit Prisma 8 only after it is generally available, in a new ADR.

## Consequences

Migrations have one owner. The web app cannot query around the API. Upgrading to Prisma 8 will be an explicit migration, not an accidental `latest` install. The schema starts without domain models; see [the data model](../architecture/data-model.md).
