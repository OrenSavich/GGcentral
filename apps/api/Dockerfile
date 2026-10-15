# Development image for the API. This is not a production image.
# Production still needs a multi-stage build, a non-root user, compiled output,
# and no source bind mounts. See docs/architecture/local-development.md.
FROM node:24.22.0-bookworm

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@12.11.2 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json

RUN pnpm install --frozen-lockfile --filter @ggcentral/api...

COPY apps/api apps/api

WORKDIR /workspace/apps/api

EXPOSE 3001

CMD ["sh", "-c", "pnpm db:generate && pnpm dev"]
