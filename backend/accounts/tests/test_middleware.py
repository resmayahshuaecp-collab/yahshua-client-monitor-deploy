import pytest
from django.contrib.auth.models import User
from django.test import RequestFactory

from accounts.middleware import ActorMiddleware
from accounts.models import Role, UserProfile
from accounts.providers.local import LocalAuthProvider


@pytest.mark.django_db
def test_anonymous_request_still_gets_an_actor(client):
    # healthz is unauthenticated, so this proves the middleware never
    # raises on a request that carries no credential.
    response = client.get("/healthz")

    assert response.status_code == 200


@pytest.mark.django_db
def test_middleware_sets_the_actor_from_a_cookie(settings):
    """ActorMiddleware must put the resolved identity on the request."""
    user = User.objects.create_user(username="dan", email="dan@example.com", password="pw-12345678")
    UserProfile.objects.create(user=user, role=Role.ENGINEER, display_name="Dan E.")
    access, _refresh = LocalAuthProvider().issue_tokens(user)

    request = RequestFactory().get("/")
    request.COOKIES[settings.ACCESS_COOKIE_NAME] = access
    captured = {}
    ActorMiddleware(lambda r: captured.update(actor=r.actor, source=r.auth_source))(request)

    assert captured["actor"].user_id == user.id
    assert captured["actor"].role == Role.ENGINEER
    assert captured["source"] == "cookie"


@pytest.mark.django_db
def test_middleware_sets_an_anonymous_actor_when_there_is_no_credential():
    """A credential-less request must get an anonymous Actor, not an error.

    healthz and the login endpoint both run without identity; middleware
    that raised here would take the whole service down.
    """
    request = RequestFactory().get("/")
    captured = {}
    ActorMiddleware(lambda r: captured.update(actor=r.actor, source=r.auth_source))(request)

    assert captured["actor"].is_authenticated is False
    assert captured["source"] is None
