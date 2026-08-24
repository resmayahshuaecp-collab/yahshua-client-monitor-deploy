# YAHSHUA Client Monitor

Internal tool for the delivery team: YBO client contracts, client concerns
(bugs and system-customization requests), meetings, and consultant
onboarding material.

This is **not** billing. Host owns subscriptions in the sell-and-invoice
sense; this tracks contract dates and client health for the people doing
delivery.

**Status: Milestone 0.** You can log in and see the shell. There is no
client data, no ticketing and no reporting yet — see
`docs/superpowers/plans/2026-08-24-milestone-0.md` for what is and is not
built.

## Ports

Seven other processes already run on the dev machine for Host, Payroll and
Numbers. This project uses three unused ports.

| | |
|---|---|
| Django | :8085 |
| Next | :3003 ← open this one |
| PostgreSQL | :5439 |

Both applications can run **natively** (`next dev` / `manage.py runserver`)
or **containerized** (dev and production Docker targets). Neither path is
the "real" one — they publish the same ports and are interchangeable. Pick
whichever is convenient; only one can hold a given port at a time.

## First run — native

```bash
make setup          # .env, pip install, npm install
make infra          # Postgres on :5439 (Docker)
make migrate
make seed           # three users, one per role
make dev-backend    # in one terminal
make dev-frontend   # in another
```

`make setup` copies `.env.example` to `.env` for the backend. The frontend's
own defaults (`http://localhost:8085`, baked into `frontend/lib/api.ts` and
the `app/api/auth/*` route handlers) are already correct for native
development, so `frontend/.env.local` is optional there. It exists for the
case where they are not enough -- e.g. a backend on a different port or
host -- and Next.js loads it automatically:

```bash
cp frontend/.env.local.example frontend/.env.local
```

## First run — containerized

Postgres always runs in Docker; the two apps sit behind compose's `apps`
profile, so `make infra` stays Postgres-only and these targets add the rest:

```bash
make build           # build both application images
make up               # Postgres + both apps, dev targets, hot reload
# make up-prod        # production images: gunicorn, `node server.js`,
#                      # collected static files, non-root
make logs             # follow both apps
make sh-backend       # shell into the backend container
make down             # stop the apps (Postgres, started by `make infra`,
                       # keeps running — `make infra-down` stops that too)
```

`make migrate` / `make seed` still work unchanged against the containerized
Postgres — they run natively (`$(PYTHON) manage.py ...`) against the
`localhost:5439` port the `postgres` service publishes, whichever way the
apps themselves are running.

Then open http://localhost:3003 and sign in as `admin@example.com` /
`pw-12345678`. The other seeded users are `consultant@example.com` and
`engineer@example.com`, same password. `make seed` refuses to run with
`DEBUG=False`.

A note on `make`: the Makefile calls `$(PYTHON)`, which defaults to
`python3`. Plain `python` is deliberately not the default — pyenv on this
machine exposes a bare `python` shim with no version bound, and it fails
with "command not found". Point it at a virtualenv instead if you have one:
`make test-backend PYTHON=.venv/bin/python`.

## Tests

```bash
make test-backend   # pytest — 37 tests
make test-frontend  # vitest — 21 tests
make test-e2e       # Playwright — 3 tests, both servers must already be running
make test           # all three in sequence
make lint           # ruff (check + format) on the backend,
                     # eslint --max-warnings=0 + tsc --noEmit on the frontend
```

There is no CI. Whatever you claim about a change has to come with the
output you actually captured.

`test:unit` + `lint` alone are not enough to prove the frontend healthy: a
page module can export something Next's App Router build rejects (only
`default` plus a fixed set of framework fields are permitted from
`page.tsx`) without either eslint, `tsc --noEmit` against a stale or absent
`.next/types`, or vitest ever seeing it. Run `cd frontend && npm run build`
(with no dev server running) as part of verifying a change — it is the
only command that actually exercises Next's page-export validation.

Never run `npm run build` while `next dev` is running — it clobbers `.next`
and makes every route hang. This also applies to `make build` / `make up`
against a native `next dev` holding the same port.

`frontend/playwright.config.ts` deliberately has no `webServer` block: both
halves are expected to already be running (started by hand, or by `make
up`) before `npx playwright test` / `make test-e2e` runs. Letting Playwright
boot its own Next server while a dev server is already up is what clobbers
`.next`.

## How identity works

Feature code never touches `django.contrib.auth.User`. It reads
`request.actor`, an `Actor` frozen dataclass, and nothing else. Which
provider fills it in is one setting:

```
AUTH_PROVIDER=local     # the only implementation today
```

`local` reads a ninja-jwt token from the `Authorization: Bearer` header
**or** the `cm_access` cookie. The cookie path is what lets the token stay
`httpOnly`, so no JavaScript can read it; the header path is what keeps the
API usable from curl and tests.

The intended second provider is `host`, for when this tool moves behind
YAHSHUA One Host — it would read the identity Host forwards and map it onto
an `Actor`, so no view changes. It is not written. Setting
`AUTH_PROVIDER=host` today raises and fails a Django system check rather
than falling back to `local`; failing open on an unknown identity provider
is a defect worth not repeating.

CSRF is enforced only on the cookie path, because a cookie is what a
browser attaches to a request an attacker's page can cause. See
`backend/accounts/csrf.py`.

**One deployment constraint.** The cookie only works while both halves
share a site. `localhost:3003` and `localhost:8085` are the same site, so
local development is fine. Split them across different registrable domains
and `SameSite=Lax` silently stops sending the cookie and every call 401s.
Deploy them as one site, or move to the header path — do not loosen the
cookie to `SameSite=None`.

## Production settings

`config/settings/production.py` requires `DJANGO_SECRET_KEY` with **no
default** — a deploy missing it refuses to start rather than booting with
the (public) development secret.

Static files **are** served in production, via WhiteNoise:
`collectstatic` runs at image build time and
`CompressedManifestStaticFilesStorage` serves the fingerprinted result, so
Django admin renders styled with no separate web server. A file
`collectstatic` didn't produce fails at deploy time instead of 404ing for a
user.

`SECURE_SSL_REDIRECT` defaults to `True` (plain http gets a 301) and is
overridable via `DJANGO_SECURE_SSL_REDIRECT` — the local prod smoke test
(`docker-compose.prod.yml`) turns it off because nothing terminates TLS in
front of a container on a laptop. `SECURE_PROXY_SSL_HEADER` is gated behind
`DJANGO_TRUST_PROXY_SSL_HEADER`, **off by default**: trusting the proxy's
`X-Forwarded-Proto` header with no real proxy in front lets any client
claim `https` and silently defeats both the redirect and the secure-cookie
flags. Turn it on only behind a load balancer that actually sets that
header.

The frontend production image builds with `output: "standalone"`
(`frontend/next.config.ts`) and runs `node server.js`, not `next start` —
the standalone bundle traces only the `node_modules` files it actually
needs, leaving out the build-time tooling (TypeScript, Vite, Playwright)
that never runs in production.

## Layout

```
backend/    Django 5.2 + django-ninja
  accounts/   the identity seam, roles, auth API
  core/       healthz, API error rendering
frontend/   Next 15 App Router, Tailwind 4
  lib/nav.ts  the one list of sections; built:false renders disabled
  e2e/        Playwright end-to-end auth proof
docs/superpowers/
  specs/      the design this was built from
  plans/      the task-by-task plan
```

Unbuilt sidebar sections render disabled, not as links. A screen that is
reachable but empty and a screen that does not exist must not look the
same.
