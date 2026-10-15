# GGcentral

One profile for your entire gaming life.

GGCentral is a gaming identity platform. The long-term product gathers a player's games, achievements, trophies, and history behind one profile. This repository is the application foundation: a modular monolith, local development setup, and the architectural boundaries for later Steam and PlayStation Network work. It does not implement those integrations.

## Stack

- NestJS 12 and Next.js 16, both TypeScript
- PostgreSQL 18 and Prisma ORM 7, owned by the API
- pnpm workspaces
- Docker Compose for local development
- GitHub Actions for validation, image publishing, and deployment

Supported runtime: Node.js 24.22.0 LTS. Docker and CI pin that version. See [docs/architecture/overview.md](docs/architecture/overview.md).

## Repository layout

```text
apps/api        NestJS API, Prisma schema, and platform adapter port
apps/web        Next.js app
docs/architecture
docs/decisions  Architecture decision records
```

There is no shared package yet. The web app talks to the API over HTTP and does not use Prisma. Domain modules for identity, libraries, and achievements are documented and not scaffolded until they have behavior.

## Prerequisites

- Node.js 24.22.0 (see `.nvmrc`)
- pnpm 12.11.2 (`packageManager` in the root `package.json`)
- Docker, for the local database and the full Compose stack

This repo's `.npmrc` uses the public npm registry.

## Local development

```bash
cp .env.example .env
pnpm install
pnpm db:generate
pnpm dev
```

`pnpm dev` starts the API on port 3001 and the web app on port 3000. PostgreSQL still has to be running. For the database, the API, and the web app together:

```bash
docker compose up --build
```

The API container publishes `http://localhost:3001`. Liveness is `GET /health`. Readiness is `GET /health/ready`. OpenAPI is served at `http://localhost:3001/docs` outside production.

More detail, including migrations and what is still required for production, is in [docs/architecture/local-development.md](docs/architecture/local-development.md).

## Checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:validate
```

Pull requests run these checks. A push to `main` runs them again, publishes `linux/arm64` images to GHCR, and deploys them to the Oracle VM.

## Production

The Oracle host runs `deploy/docker-compose.yml` from `/home/ubuntu/ggcentral`. Caddy publishes port 80 only. The web app is served at `/`, and the API is served at `/api`. PostgreSQL has no published port. Production environment values live in `/home/ubuntu/ggcentral/.env` on the server. See [deploy/env.production.example](deploy/env.production.example).

GitHub Actions stores the Oracle SSH private key and host key as repository secrets. GHCR login uses the workflow token for the duration of the pull, then logs out. The database password is not a GitHub secret.

The VM firewall allows port 80. The Oracle subnet security list, and any network security group attached to the instance, must allow inbound TCP 80 as well. The server IP is ephemeral. After it changes, update `WEB_ORIGIN` in the server `.env`, `ORACLE_SSH_HOST`, and `ORACLE_SSH_KNOWN_HOSTS`, then rerun the Deploy workflow. The web image does not contain the IP. Add a domain and HTTPS in the Caddyfile when a name exists.

## Further reading

- [Architecture overview](docs/architecture/overview.md)
- [Data model](docs/architecture/data-model.md)
- [Integrations](docs/architecture/integrations.md)
- [Agent instructions](AGENTS.md)
- [Decision records](docs/decisions)
