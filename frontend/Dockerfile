# syntax=docker/dockerfile:1

# Two targets, selected with --target:
#   dev  -- source is bind-mounted, `next dev` serves it with hot reload
#   prod -- `next build` output served by `next start`, non-root
#
# The container listens on 3003, the same port the native workflow and the
# npm scripts use, so nothing has to know whether it is containerised.

# Debian (glibc), not Alpine (musl), on purpose. package-lock.json is
# generated on a glibc host, so it pins Next's @next/swc-linux-x64-GNU binary.
# On Alpine that shared library cannot load, Next falls back to WASM, and the
# production server exits 1 outright. Matching the lockfile's libc is cheaper
# than maintaining a musl lockfile.
FROM node:20-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1


# --- deps --------------------------------------------------------------
# Shared by both targets. Copying only the manifests means a source edit does
# not re-run npm ci.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci


# --- dev ---------------------------------------------------------------
FROM base AS dev

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Deliberately no `COPY . .` -- compose bind-mounts the source. node_modules
# stays inside the image and compose masks the host's copy with an anonymous
# volume, so a host install built for a different platform cannot leak in.

EXPOSE 3003
CMD ["npm", "run", "dev"]


# --- build -------------------------------------------------------------
# Needs the dev dependencies (typescript, tailwind, the eslint config), so it
# builds from `deps` rather than a pruned tree.
FROM deps AS build
COPY . .
RUN npm run build


# --- prod --------------------------------------------------------------
FROM base AS prod
ENV NODE_ENV=production

# node_modules comes from `deps` rather than being reinstalled: `npm ci
# --omit=dev` would drop packages Next needs at runtime in a non-standalone
# build. Trading image size for a server that actually starts.
# --chown on each COPY, never a `RUN chown -R` afterwards: chown rewrites
# every file into a new layer, so a separate step stored all ~800MB of
# node_modules and .next a second time and doubled the image.
#
# The node image ships an unprivileged `node` user (uid 1000). Ownership has
# to be its, because Next writes into .next and node_modules at startup and
# exits 1 on EACCES.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --chown=node:node package.json package-lock.json next.config.ts ./

USER node

EXPOSE 3003
CMD ["npm", "run", "start"]
