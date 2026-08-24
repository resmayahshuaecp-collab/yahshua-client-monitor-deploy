import pytest
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.test import Client, RequestFactory

from accounts.models import Role, UserProfile
from accounts.providers.local import LocalAuthProvider


@pytest.fixture
def engineer(db):
    user = User.objects.create_user(
        username="eng@example.com", email="eng@example.com", password="pw-12345678"
    )
    UserProfile.objects.create(user=user, role=Role.ENGINEER, display_name="Eng E.")
    return user


@pytest.mark.django_db
def test_cookie_authenticated_post_without_csrf_is_refused(engineer, settings):
    client = Client(enforce_csrf_checks=True)
    access, _refresh = LocalAuthProvider().issue_tokens(engineer)
    client.cookies[settings.ACCESS_COOKIE_NAME] = access

    response = client.post("/api/auth/logout")

    assert response.status_code == 403
    assert response.json()["code"] == "csrf_failed"


@pytest.mark.django_db
def test_cookie_authenticated_post_with_csrf_succeeds(engineer, settings):
    client = Client(enforce_csrf_checks=True)
    access, _refresh = LocalAuthProvider().issue_tokens(engineer)
    client.cookies[settings.ACCESS_COOKIE_NAME] = access
    token = get_token(RequestFactory().get("/"))
    client.cookies["csrftoken"] = token

    response = client.post("/api/auth/logout", HTTP_X_CSRFTOKEN=token)

    assert response.status_code == 200
    assert response.json() == {"ok": True}


@pytest.mark.django_db
def test_header_authenticated_post_needs_no_csrf(engineer):
    # A bearer header is not sent automatically by a browser, so there is
    # nothing for an attacker's page to ride on. Requiring CSRF here would
    # only break curl and server-to-server callers.
    client = Client(enforce_csrf_checks=True)
    access, _refresh = LocalAuthProvider().issue_tokens(engineer)

    response = client.post("/api/auth/logout", HTTP_AUTHORIZATION=f"Bearer {access}")

    assert response.status_code == 200
