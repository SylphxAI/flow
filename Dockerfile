# syntax=docker/dockerfile:1.7@sha256:a57df69d0ea827fb7266491f2813635de6f17269be881f696fbfdf2d83dda33e
# flow docs — VitePress static site built with Bun, served by Caddy.
#
# Mirrors the Sylphx Platform canonical `bun-static` buildpack template
# (ADR-071 v2: package.json frontend build -> Caddy). flow is a Bun *workspace*
# monorepo with a turbo.json, so the platform's `auto` buildpack routes it to a
# node-server build instead of the static path — the docs site therefore
# declares an explicit Dockerfile, the same escape hatch every first-party
# Sylphx app uses. Base images are digest-pinned to match the platform's
# base-images.json.

ARG SOURCE_DATE_EPOCH

FROM oven/bun:1.3-alpine@sha256:4de475389889577f346c636f956b42a5c31501b654664e9ae5726f94d7bb5349 AS builder
WORKDIR /app
# VitePress and its bundler live in devDependencies; keep the build stage in
# development mode so they install.
ENV NODE_ENV=development
# Bun reconciles the frozen lockfile against every workspace manifest, so copy
# the whole tree before install rather than just the root package.json.
COPY . ./
RUN --mount=type=cache,id=bun-flow-docs,target=/root/.bun/install/cache,sharing=locked \
    bun install --frozen-lockfile
RUN bun run docs:build

FROM builder AS probe
WORKDIR /app
# L3 static-output probe — the build must produce a document Caddy can serve.
RUN test -f docs/.vitepress/dist/index.html

FROM caddy:2-alpine@sha256:834468128c7696cec0ceea6172f7d692daf645ae51983ca76e39da54a97c570d AS runner
WORKDIR /srv
ARG SOURCE_DATE_EPOCH
# VitePress is a static MPA: resolve clean URLs to their `.html` file and
# directory indexes, falling back to index.html for client-routed deep links.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
 && chown -R appuser:appgroup /srv \
 && printf ':3000 {\n  root * /srv\n  encode gzip\n  try_files {path} {path}.html {path}/ /index.html\n  file_server\n}\n' > /etc/caddy/Caddyfile
COPY --from=probe --chown=appuser:appgroup /app/docs/.vitepress/dist /srv
USER appuser
EXPOSE 3000
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
