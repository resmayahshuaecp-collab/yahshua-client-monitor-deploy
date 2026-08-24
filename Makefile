.PHONY: help setup infra infra-down migrate seed dev dev-backend dev-frontend test test-backend test-frontend test-e2e lint build up up-prod down logs sh-backend

BACKEND := backend
FRONTEND := frontend

# pyenv exposes a bare `python` shim with no version bound to it, so `python`
# fails with "command not found" while `python3` works. Override on the
# command line to point at a venv: `make test-backend PYTHON=.venv/bin/python`.
PYTHON ?= python3
PIP ?= $(PYTHON) -m pip

help:
	@grep -E '^[a-z0-9-]+:' $(MAKEFILE_LIST) | sed 's/:.*//' | sort

setup:
	cp -n .env.example .env || true
	cd $(BACKEND) && $(PIP) install -r requirements/local.txt
	cd $(FRONTEND) && npm install

infra:
	docker compose up -d postgres

infra-down:
	docker compose down

# --- containerised apps (optional; the native targets above still work) ---
# The apps sit behind compose's `apps` profile, so `make infra` stays
# Postgres-only. These publish the same ports as the native path: 8085, 3003.
COMPOSE_PROD := -f docker-compose.yml -f docker-compose.prod.yml

build:
	docker compose --profile apps build

up:
	docker compose --profile apps up -d --build
	@echo "backend  http://localhost:8085/healthz"
	@echo "frontend http://localhost:3003"

up-prod:
	docker compose $(COMPOSE_PROD) --profile apps up -d --build
	@echo "production images. http gets a 301 to https -- SECURE_SSL_REDIRECT."

down:
	docker compose --profile apps down

logs:
	docker compose --profile apps logs -f --tail=50

sh-backend:
	docker compose exec backend bash

migrate:
	cd $(BACKEND) && $(PYTHON) manage.py migrate

seed:
	cd $(BACKEND) && $(PYTHON) manage.py seed_local_users

dev-backend:
	cd $(BACKEND) && $(PYTHON) manage.py runserver 8085

dev-frontend:
	cd $(FRONTEND) && npm run dev

test-backend:
	cd $(BACKEND) && $(PYTHON) -m pytest

test-frontend:
	cd $(FRONTEND) && npm run test:unit

test-e2e:
	cd $(FRONTEND) && npx playwright test

test: test-backend test-frontend test-e2e

lint:
	cd $(BACKEND) && ruff check . && ruff format --check .
	cd $(FRONTEND) && npm run lint && npx tsc --noEmit
