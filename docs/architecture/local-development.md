# Local development

## Prerequisites

- Node.js 24.22.0, listed in `.nvmrc`. Docker and CI use this version. Prisma ORM 7 supports the Node.js 24 line.
- pnpm 12.11.2, pinned by `packageManager` in the root `package.json`.
- Docker, with a daemon that can run `linux/arm64` images. The official Node.js and PostgreSQL images publish that architecture.

The repository `.npmrc` sets the public npm registry so installs do not depend on a private registry configured for another project.

## Environment

Copy the example file and leave the real file untracked:

```bash
cp .env.example .env
```

| Variable                                                             | Purpose                                                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Local PostgreSQL. The example password is a placeholder, not a production secret.                                   |
| `DATABASE_URL`                                                       | API connection string. On the host it uses `localhost`. Compose points the API container at the `postgres` service. |
| `API_PORT`                                                           | API port. Default `3001`.                                                                                           |
| `WEB_PORT`                                                           | Web port. Default `3000`.                                                                                           |
| `WEB_ORIGIN`                                                         | Browser origin allowed by API CORS.                                                                                 |
| `NEXT_PUBLIC_API_URL`                                                | Base URL the web app uses to call the API from the browser.                                                         |
| `LOG_LEVEL`                                                          | Pino level.                                                                                                         |
| `NODE_ENV`                                                           | `development`, `test`, or `production`.                                                                             |

The API refuses to start when `DATABASE_URL` is missing or is not a PostgreSQL URL.

## Database and the apps

PostgreSQL only:

```bash
docker compose up postgres
pnpm install
pnpm db:generate
pnpm dev
```

API, web, and PostgreSQL together:

```bash
docker compose up --build
```

Compose publishes PostgreSQL on `localhost:5432` for host tools. The Postgres 18 image keeps its data under `/var/lib/postgresql`, and that is the volume mount. A production compose file must not publish that port. The API waits until PostgreSQL is healthy. The web app waits until `GET /health` succeeds. Readiness, `GET /health/ready`, runs `SELECT 1` and does not require a domain schema.

The Dockerfiles in `apps/api` and `apps/web` are development images. They install dependencies and run the dev servers. Compose builds them from the repository root so the pnpm lockfile is available. An anonymous volume keeps the API container's generated Prisma client separate from the host's copy.

## Migrations

Schema changes belong in `apps/api/prisma/migrations`. Generate the client after a schema change:

```bash
pnpm db:generate
pnpm --filter @ggcentral/api db:migrate
```

There are no domain models and no migrations yet. `pnpm db:validate` checks the current schema. Do not add tables until the open questions in [data-model.md](data-model.md) are decided.

## Checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:validate
```

The API uses Vitest and oxlint. The web app uses ESLint. Prettier is configured at the repository root. Tests do not need a running database: readiness is exercised with a fake Prisma client, and the platform port is exercised with an in-memory adapter.

Set `DATABASE_URL` when running `pnpm db:validate` outside Compose. The example value is enough. The command does not connect.

## Production

`apps/api/Dockerfile` and `apps/web/Dockerfile` are development images. Production images are `apps/api/Dockerfile.production` and `apps/web/Dockerfile.production`. They compile the apps, run as the `node` user, and are published for `linux/arm64`.

`deploy/docker-compose.yml` runs those images on the Oracle VM. It does not publish PostgreSQL. Caddy on port 80 forwards `/` to the web app and `/api` to the API. The web image calls `/api` on the same origin, so replacing the ephemeral server IP does not require a new web build. Set the new origin in the server's `.env` because the API uses it for CORS.

The server `.env` is created on the host. GitHub Actions copies the Compose file and Caddyfile, pulls the images for the commit SHA, and restarts the stack. TLS waits until the deployment has a domain.
