# Development image for the web app. This is not a production image.
# Production still needs a multi-stage build, a non-root user, and `next build`.
# See docs/architecture/local-development.md.
FROM node:24.22.0-bookworm

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@12.11.2 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile --filter @ggcentral/web...

COPY apps/web apps/web

WORKDIR /workspace/apps/web

EXPOSE 3000

CMD ["pnpm", "dev"]
