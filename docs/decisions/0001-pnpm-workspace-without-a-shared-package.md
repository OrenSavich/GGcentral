# ADR 0001: pnpm workspace without a shared package

## Status

Accepted

## Context

The API and the web app are separate deployable units that share a repository, a lockfile, and a few development commands. They do not yet share runtime code. A task runner or a shared package would add structure before there is a contract to put in it.

## Decision

Use pnpm workspaces. `pnpm-workspace.yaml` includes `apps/*` and `packages/*`. Do not add Turborepo, Nx, or `packages/shared`. Add a shared package only when the API and the web app have a real shared contract. The web app must not import NestJS or Prisma to avoid that package.

## Consequences

Root scripts delegate to the apps. A future shared package can be added under `packages/` without changing the workspace layout. Until then, HTTP is the only contract between the apps.
