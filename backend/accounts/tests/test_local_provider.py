import pytest
from django.contrib.auth.models import User
from django.test import RequestFactory

from accounts.models import Role, UserProfile
from accounts.providers.local import LocalAuthProvider


@pytest.fixture
def consultant(db):
    user = User.objects.create_user(
        username="rina", email="rina@example.com", password="pw-12345678"
    )
    UserProfile.objects.create(user=user, role=Role.CONSULTANT, display_name="Rina C.")
    return user


@pytest.fixture
def provider():
    return LocalAuthProvider()


def test_no_credential_resolves_to_none(provider):
    request = RequestFactory().get("/")

    assert provider.resolve(request) is None


def test_header_credential_resolves_to_actor(provider, consultant):
    access, _refresh = provider.issue_tokens(consultant)
    request = RequestFactory().get("/", HTTP_AUTHORIZATION=f"Bearer {access}")

    result = provider.resolve(request)

    assert result.source == "header"
    assert result.actor.user_id == consultant.id
    assert result.actor.email == "rina@example.com"
    assert result.actor.name == "Rina C."
    assert result.actor.role == Role.CONSULTANT
    assert result.actor.is_authenticated is True


def test_cookie_credential_resolves_to_the_same_actor(provider, consultant, settings):
    access, _refresh = provider.issue_tokens(consultant)
    request = RequestFactory().get("/")
    request.COOKIES[settings.ACCESS_COOKIE_NAME] = access

    result = provider.resolve(request)

    assert result.source == "cookie"
    assert result.actor.user_id == consultant.id
    assert result.actor.role == Role.CONSULTANT


def test_header_wins_over_cookie(provider, consultant, settings):
    access, _refresh = provider.issue_tokens(consultant)
    request = RequestFactory().get("/", HTTP_AUTHORIZATION=f"Bearer {access}")
    request.COOKIES[settings.ACCESS_COOKIE_NAME] = access

    assert provider.resolve(request).source == "header"


def test_garbage_token_resolves_to_none(provider):
    request = RequestFactory().get("/", HTTP_AUTHORIZATION="Bearer not-a-token")

    assert provider.resolve(request) is None


def test_user_without_profile_resolves_with_no_role(provider, db):
    user = User.objects.create_user(username="orphan", password="pw-12345678")
    access, _refresh = provider.issue_tokens(user)
    request = RequestFactory().get("/", HTTP_AUTHORIZATION=f"Bearer {access}")

    result = provider.resolve(request)

    assert result.actor.is_authenticated is True
    assert result.actor.role is None


def test_inactive_user_does_not_resolve(provider, db):
    user = User.objects.create_user(
        username="gone", email="gone@example.com", password="pw-12345678"
    )
    access, _refresh = provider.issue_tokens(user)
    user.is_active = False
    user.save()
    request = RequestFactory().get("/", HTTP_AUTHORIZATION=f"Bearer {access}")

    assert provider.resolve(request) is None
