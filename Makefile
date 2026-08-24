.PHONY: help setup infra infra-down migrate seed dev dev-backend dev-frontend test test-backend test-frontend test-e2e lint

BACKEND := backend
FRONTEND := frontend

help:
	@grep -E '^[a-z-]+:' $(MAKEFILE_LIST) | sed 's/:.*//' | sort

setup:
	cp -n .env.example .env || true
	cd $(BACKEND) && pip install -r requirements/local.txt
	cd $(FRONTEND) && npm install

infra:
	docker compose up -d postgres

infra-down:
	docker compose down

migrate:
	cd $(BACKEND) && python manage.py migrate

seed:
	cd $(BACKEND) && python manage.py seed_local_users

dev-backend:
	cd $(BACKEND) && python manage.py runserver 8085

dev-frontend:
	cd $(FRONTEND) && npm run dev

test-backend:
	cd $(BACKEND) && python -m pytest

test-frontend:
	cd $(FRONTEND) && npm run test:unit

test-e2e:
	cd $(FRONTEND) && npx playwright test

test: test-backend test-frontend test-e2e

lint:
	cd $(BACKEND) && ruff check . && ruff format --check .
	cd $(FRONTEND) && npm run lint && npx tsc --noEmit
