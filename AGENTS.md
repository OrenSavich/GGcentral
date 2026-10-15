# Agent instructions

These rules apply to every change in this repository.

## Product boundary

GGCentral collects a gamer's identity across platforms. The core domain is profiles, connected platform accounts, games, libraries, and achievements. Do not turn the first releases into a social network.

Steam and PlayStation Network are the first integrations. Xbox, Epic, Nintendo, Discord, and Twitch may be added later only as new adapters behind the existing port. Do not implement a platform client until [docs/architecture/integrations.md](docs/architecture/integrations.md) has a research note for that platform covering access, rate limits, terms, and which fields actually exist.

## Architecture boundaries

- The domain must not import Steam or PSN types, response bodies, or identifier names. Adapters map vendor data into the snapshots in `apps/api/src/integrations/platform-adapter.ts`.
- The web app must not import NestJS, Prisma, or talk to PostgreSQL. It calls the API.
- Do not add `packages/shared` until the API and web share a real contract.
- Keep one deployable API. Do not add Redis, a queue, Kafka, or Kubernetes without a demonstrated MVP requirement recorded in an ADR.
- Prisma schema and migrations stay in `apps/api`. Schema changes ship as versioned migrations. Do not edit an applied migration.
- Null means the platform did not supply a value. An empty collection means a completed sync found nothing. Do not collapse those states.

Read [docs/architecture/overview.md](docs/architecture/overview.md) and the ADRs in [docs/decisions](docs/decisions) before changing module boundaries.

## Coding standards

- TypeScript strict mode. The API is ESM: relative imports use `.js` extensions.
- Validate environment variables and HTTP boundaries with Zod. The API uses Nest's Standard Schema support.
- Prefer an existing constant over a repeated path, URL prefix, or protocol token.
- Keep framework defaults unless a change is recorded: Vitest and oxlint for the API, ESLint for the web app, Prettier at the repository root.
- Add or update tests for behavior you change. Business rules and adapters must be testable without a live platform or a live database.
- Do not generate a production database schema ahead of the open questions in [docs/architecture/data-model.md](docs/architecture/data-model.md).

## Security

- Never commit secrets, `.env` files, access tokens, or database credentials. `.env.example` contains local placeholders only.
- Do not log authorization headers, cookies, tokens, passwords, or connection strings. Logging redaction lives in `apps/api/src/common/redaction.ts`. Extend it when a new sensitive field appears.
- HTTP 500 responses use a generic message. Do not return exception text, SQL, or upstream bodies to clients.
- PostgreSQL may be published on localhost for development. Do not publish it on a production network.
- Do not copy private keys or credential files into this repository.

## Prohibited shortcuts

- No Steam, PSN, or other platform API client, unofficial wrapper, or scraped credential flow in this repository until the integration research note exists.
- No authentication or account-linking flow until the product decision is written down.
- No hand-written database changes outside Prisma migrations.
- No production secrets in the repository or in workflow logs. Production deploys from `main` through `.github/workflows/deploy.yml`. The server `.env`, database password, and SSH private key stay out of Git.
- No dependency floating onto Prisma 8 while it is a release candidate. The API pins Prisma 7.
- No commit or push unless the user explicitly asks.
