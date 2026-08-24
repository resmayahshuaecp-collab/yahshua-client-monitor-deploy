import importlib

import pytest
from django.core.exceptions import ImproperlyConfigured
from django.test import Client


@pytest.mark.django_db
def test_local_settings_accept_the_compose_backend_hostname(settings):
    """Host: backend must be accepted under local settings.

    docker-compose.yml has Next's route handlers reach Django at
    http://backend:8085 (compose service DNS), so every proxied login and
    refresh arrives with Host: backend. This must fail if "backend" is ever
    dropped from local.py's ALLOWED_HOSTS default.
    """
    local = importlib.import_module("config.settings.local")

    settings.ALLOWED_HOSTS = local.ALLOWED_HOSTS
    assert "backend" in local.ALLOWED_HOSTS

    response = Client().get("/healthz", SERVER_NAME="backend")

    assert response.status_code == 200


def test_production_requires_an_explicit_secret_key(monkeypatch):
    """A production deploy missing DJANGO_SECRET_KEY must refuse to start.

    Booting with base.py's development default would mean forgeable
    signed cookies and password-reset tokens.
    """
    import importlib
    import sys

    monkeypatch.delenv("DJANGO_SECRET_KEY", raising=False)
    monkeypatch.setenv("DATABASE_URL", "postgres://u:p@localhost:5439/db")

    # Remove the module from sys.modules so it gets reimported
    if "config.settings.production" in sys.modules:
        del sys.modules["config.settings.production"]

    with pytest.raises(ImproperlyConfigured):
        importlib.import_module("config.settings.production")
