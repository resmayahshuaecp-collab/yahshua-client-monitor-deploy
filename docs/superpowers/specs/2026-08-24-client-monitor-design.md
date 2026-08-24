# YAHSHUA Client Monitor — Milestone 0 design

- **Date:** 24 August 2026
- **Status:** approved in chat, pending review of this document
- **Scope of this spec:** Milestone 0 only (project setup, auth, layout, dashboard shell)
- **Source of requirements:** `Subscription_System_Plan .xlsx` (openpyxl, created 2026-08-24T03:23Z), sheets *Milestones & Tasks* and *Gantt Timeline*

## 1. What this is

An internal tool for the consultant and engineer team to monitor YBO client
accounts: contract expiry, client concerns (bugs and system-customization
requests), meetings, and consultant onboarding material.

It is **not** billing. Host already owns subscriptions in the
sell-and-invoice sense. This tool tracks *contract dates and client health*
for the delivery team, which is why the repository is named
`yahshua-client-monitor` rather than after the plan's own "Subscription
System" title.

### Milestone 0 delivers

The five stories the plan lists under Milestone 0:

1. Repo with Django backend and Next.js frontend structure
2. Database configured and connected to Django
3. User authentication and roles (login, session)
4. Base layout: sidebar navigation and top bar
5. Dashboard shell: 6 stat cards and overview panels, placeholders, wired later

### Explicitly not in Milestone 0

Client, Bug, RSC and Meeting models; the messaging system; onboarding pages;
reports; AI support; search; notifications. The 6 stat cards render fixed
placeholder values and are wired to nothing.

## 2. Decisions taken, with reasons

| Decision | Choice | Why |
|---|---|---|
| Backend framework | Django 5.2 + `django-ninja` 1.5.0, `ninja-extra`, `ninja-jwt` | Matches `yahshua-one-numbers` exactly, so conventions and reviewers transfer |
| Database | PostgreSQL | The plan said "PostgreSQL/MySQL". Every other backend in the org is Postgres; MySQL would fork the ops story for no gain |
| Product shape | Standalone, with a swappable auth seam | Decided in brainstorming. No Host dependency now; Host can be added later without touching feature code |
| Frontend–backend transport | Direct calls, one auth proxy route | A full BFF doubles the surface for every endpoint, and M1–M3 add roughly twenty |
| Roles | `TextChoices` field on a profile model | The role set is small and fixed. Django Groups would have to be re-derived from Host later anyway |
| Async work | None | Milestone 0 needs no queue. No Celery, no Redis |

## 3. Architecture

### 3.1 Repository layout

```
yahshua-client-monitor/
├── Makefile                 setup, infra, dev, test, lint
├── README.md                ports, first run, the auth-seam note
├── docker-compose.yml       Postgres only
├── docs/superpowers/specs/  this document
├── backend/
│   ├── manage.py  pytest.ini  ruff.toml
│   ├── requirements/{base,local,production}.txt
│   ├── config/
│   │   ├── settings/{base,local,production,test}.py
│   │   └── urls.py  wsgi.py  asgi.py
│   ├── accounts/            the auth seam, login/refresh/me, roles
│   └── core/                healthz, API error handlers, API registration
└── frontend/
    ├── app/
    │   ├── layout.tsx  page.tsx
    │   ├── login/page.tsx
    │   ├── (app)/dashboard/page.tsx
    │   └── api/auth/login/route.ts     the one proxy route
    ├── components/layout/{sidebar,topbar}.tsx
    ├── components/ui/                  card, button, input
    ├── lib/{api.ts,query-client.tsx}
    ├── e2e/                            Playwright
    └── Tailwind 4 / vitest / eslint config mirroring Numbers
```

### 3.2 The auth seam

The point of the seam is that **no feature code ever imports
`django.contrib.auth.User`**. Feature code reads one type, `Actor`, and one
attribute, `request.actor`. Swapping the identity source later means writing
one new provider, not editing every view.

| Unit | Purpose | Depends on |
|---|---|---|
| `accounts/actor.py` | Frozen dataclass `Actor(user_id, email, name, role, is_authenticated)`. The only identity type feature code reads. | Nothing |
| `accounts/providers/base.py` | `AuthProvider` protocol: `resolve(request) -> Actor \| None`. Its docstring records that a Host provider is the intended second implementation and what it would read. | `actor.py` |
| `accounts/providers/local.py` | The only implementation now. Reads the `ninja-jwt` bearer token, loads the local user and profile, returns an `Actor`. | `base.py`, Django auth |
| `accounts/middleware.py` | Calls the configured provider and sets `request.actor`. Never raises on an anonymous request; it sets an unauthenticated `Actor`. | `base.py` |
| `accounts/permissions.py` | Role checks expressed against `Actor.role`, not against Django permissions. | `actor.py` |
| `accounts/api.py` | `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`. | `ninja-jwt`, `actor.py` |

Provider selection is one setting, `AUTH_PROVIDER`, defaulting to `local`.
An unknown value must **fail loudly at startup** via a Django system check —
never fall back to `local`. Failing open on an unknown identity provider is
the same defect already found in Host's entitlement code, and it is worth
not repeating.

Roles: `ADMIN`, `CONSULTANT`, `ENGINEER`. A user with no profile resolves to
an `Actor` with `role=None`, and `permissions.py` refuses such an actor
rather than treating it as a default role.

### 3.3 Authentication flow

1. Browser posts credentials to the Next route handler `POST /api/auth/login`.
2. The handler calls Django `POST /api/auth/login`, receives access and
   refresh tokens, and sets both as `httpOnly`, `SameSite=Lax` cookies.
   Tokens are never written to `localStorage`.
3. Every later call goes browser → Django directly. `lib/api.ts` is an axios
   instance with `withCredentials: true`, so the cookie rides along and no
   JavaScript ever reads the token. Its response interceptor retries the
   request once through `POST /api/auth/refresh` on a 401, and redirects to
   `/login` if that refresh also fails.
4. `accounts/providers/local.py` reads the access token from the
   `Authorization: Bearer` header **or** the access cookie, in that order,
   and resolves it to an `Actor`. Accepting the cookie is what lets the token
   stay `httpOnly`; accepting the header is what keeps the API usable from
   curl and from tests.
5. Because the token travels as a cookie, every state-changing request needs
   CSRF protection: Django's `CsrfViewMiddleware` stays enabled, the login
   handler also sets the CSRF cookie, and `lib/api.ts` sends the
   `X-CSRFToken` header on POST, PUT, PATCH and DELETE.

CORS is configured with `django-cors-headers` for the Next origin only, with
credentials allowed.

**The cookie only works this way while both halves share a site.** In local
development `localhost:3003` and `localhost:8085` are the same site — ports
are not part of a cookie's scope — so `SameSite=Lax` is correct and the
cookie is sent. If the two halves are ever deployed to different registrable
domains, `Lax` silently stops sending it and every call 401s. Deploy them as
one site (a path split, or sibling subdomains with `Domain` set), and if that
ever stops being true, switch to the `Authorization` header path in step 4
rather than loosening the cookie to `SameSite=None`.

### 3.4 Dashboard shell

`app/(app)/dashboard/page.tsx` renders six stat cards — Total Clients, Globe
Clients, SME Clients, Active Contracts, Open Concerns, Meetings This Week —
and two empty overview panels, Subscription Overview and Client Concerns
Overview. Every value is a literal placeholder. Each card carries a
`data-placeholder` attribute so a later milestone can find every site that
still needs wiring with one grep, and so the Playwright test can assert the
shell is a shell.

The sidebar lists the sections the plan names — Dashboard, Globe Clients, SME
Clients, Bugs, RSC, Meetings, Reports, Training — with the unbuilt ones
rendered as visibly disabled items, not as links to 404s. A screen that is
reachable but empty and a screen that does not exist should not look the
same.

## 4. Ports and local environment

Seven processes already run on this machine for Host, Payroll and Numbers.
Milestone 0 takes three unused ports.

| Process | Port |
|---|---|
| Django `runserver` | 8085 |
| Next `next dev` | 3003 |
| PostgreSQL (Docker) | 5439 |

Docker runs Postgres only. Image builds do not work on this machine, so both
applications run natively.

## 5. Testing

| Layer | Tool | What is actually asserted |
|---|---|---|
| Backend | pytest + pytest-django | Login returns a token; a bad password is refused; `me` reflects the actor; a request authenticated by cookie resolves the same actor as one authenticated by header; a state-changing request without a CSRF token is refused; an unknown `AUTH_PROVIDER` fails the system check; a role-gated endpoint refuses an actor with no role |
| Frontend unit | vitest + Testing Library | The dashboard renders six cards; the sidebar marks unbuilt sections disabled |
| End to end | Playwright | Log in, land on the dashboard, see six cards, sign out |
| Lint | ruff, eslint, tsc | Clean |

`make test` runs all of it. There is no CI available, so the evidence for
this milestone is captured local output, and verification is done by driving
the application in a browser rather than by rendering pages in isolation.

## 6. Risks and open questions

1. **Duplication with Host.** Contract expiry tracking and a ticket system
   both already exist in Host, in a different stack. Milestone 0 does not
   build either, so nothing is duplicated yet, but the question should be
   answered before Milestone 1 starts rather than after.
2. **A chat platform sits inside Milestone 1.** Conversations, messages,
   unread counts and four channel types are a system, not a sub-task, and
   the plan already links out to Pumble. Out of scope here; flagged.
3. **The plan's schedule overlaps.** Milestones 0 and 1 both start 25
   August; Milestone 3 and "MVP Testing & Fixes" occupy the same week. Not
   this spec's problem, but it means Milestone 0's four days are the only
   uncontended window in the plan.
4. **No acceptance criteria upstream.** Every story in the spreadsheet is
   "build X". Section 5 of this document is therefore the acceptance
   criteria for Milestone 0, invented here rather than inherited.
5. **Segment is an enum.** `Globe` and `SME` will be modelled as a choices
   field in Milestone 1. A third segment would be a migration, not
   configuration. Worth confirming with whoever owns the segmentation.
