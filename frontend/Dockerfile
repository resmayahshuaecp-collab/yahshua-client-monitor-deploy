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

# A standalone build carries its own minimal node_modules and a server.js, so
# nothing is installed here and `next start` is not used. What is NOT traced
# into it is the point: typescript, vite, rolldown, playwright and the rest of
# the build-time tree never reach production.
#
# --chown on each COPY rather than a `RUN chown -R` afterwards: chown rewrites
# every file into a new layer and would store the whole tree twice.
COPY --from=build --chown=node:node /app/.next/standalone ./
# Static assets and the client chunks are deliberately outside the standalone
# bundle; without this copy the pages render unstyled and the JS 404s.
COPY --from=build --chown=node:node /app/.next/static ./.next/static

# Next writes into .next at startup and exits on EACCES, so ownership must be
# the unprivileged user's (uid 1000, shipped by the node image).
USER node

# server.js reads both. HOSTNAME defaults to localhost, which inside a
# container means the port is published but nothing outside can reach it.
ENV PORT=3003 \
    HOSTNAME=0.0.0.0

EXPOSE 3003
CMD ["node", "server.js"]
