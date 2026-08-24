import pytest
from django.core.exceptions import ImproperlyConfigured


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
