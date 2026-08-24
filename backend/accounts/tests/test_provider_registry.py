import pytest
from django.core.checks import run_checks
from django.test import override_settings

from accounts.actor import Actor
from accounts.providers import UnknownAuthProvider, get_provider


def test_anonymous_actor_is_not_authenticated():
    actor = Actor.anonymous()

    assert actor.is_authenticated is False
    assert actor.user_id is None
    assert actor.role is None


def test_actor_is_immutable():
    actor = Actor.anonymous()

    with pytest.raises(Exception):
        actor.role = "ADMIN"


@override_settings(AUTH_PROVIDER="local")
def test_local_is_the_configured_provider():
    from accounts.providers.local import LocalAuthProvider

    assert isinstance(get_provider(), LocalAuthProvider)


@override_settings(AUTH_PROVIDER="host")
def test_unknown_provider_raises_rather_than_falling_back():
    # "host" is the documented future provider, deliberately not implemented.
    # Falling back to local here would silently authenticate against the
    # wrong identity source -- the same failing-open defect already present
    # in Host's entitlement code.
    with pytest.raises(UnknownAuthProvider) as excinfo:
        get_provider()

    assert "host" in str(excinfo.value)


@override_settings(AUTH_PROVIDER="nonsense")
def test_unknown_provider_fails_the_system_check():
    errors = run_checks()

    assert [error.id for error in errors] == ["accounts.E001"]
