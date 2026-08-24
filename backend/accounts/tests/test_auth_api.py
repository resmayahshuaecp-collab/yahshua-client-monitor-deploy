import pytest
from django.contrib.auth.models import User

from accounts.models import Role, UserProfile
from accounts.providers.local import LocalAuthProvider


@pytest.fixture
def admin_user(db):
    user = User.objects.create_user(
        username="admin@example.com", email="admin@example.com", password="pw-12345678"
    )
    UserProfile.objects.create(user=user, role=Role.ADMIN, display_name="Ada A.")
    return user


@pytest.mark.django_db
def test_login_returns_tokens_and_actor(client, admin_user):
    response = client.post(
        "/api/auth/login",
        {"email": "admin@example.com", "password": "pw-12345678"},
        content_type="application/json",
    )

    assert response.status_code == 200
    body = response.json()
    assert body["access"]
    assert body["refresh"]
    assert body["actor"] == {
        "user_id": admin_user.id,
        "email": "admin@example.com",
        "name": "Ada A.",
        "role": "ADMIN",
    }


@pytest.mark.django_db
def test_wrong_password_is_refused_without_saying_which_field(client, admin_user):
    response = client.post(
        "/api/auth/login",
        {"email": "admin@example.com", "password": "wrong"},
        content_type="application/json",
    )

    assert response.status_code == 403
    assert response.json()["code"] == "invalid_credentials"


@pytest.mark.django_db
def test_unknown_email_is_refused_identically(client):
    response = client.post(
        "/api/auth/login",
        {"email": "nobody@example.com", "password": "pw-12345678"},
        content_type="application/json",
    )

    assert response.status_code == 403
    assert response.json()["code"] == "invalid_credentials"


@pytest.mark.django_db
def test_me_reflects_the_actor_on_the_header_path(client, admin_user):
    access, _refresh = LocalAuthProvider().issue_tokens(admin_user)

    response = client.get("/api/auth/me", HTTP_AUTHORIZATION=f"Bearer {access}")

    assert response.status_code == 200
    assert response.json()["role"] == "ADMIN"


@pytest.mark.django_db
def test_me_reflects_the_same_actor_on_the_cookie_path(client, admin_user, settings):
    access, _refresh = LocalAuthProvider().issue_tokens(admin_user)
    client.cookies[settings.ACCESS_COOKIE_NAME] = access

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["role"] == "ADMIN"


@pytest.mark.django_db
def test_me_is_401_when_anonymous(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


@pytest.mark.django_db
def test_refresh_returns_a_new_access_token(client, admin_user):
    _access, refresh = LocalAuthProvider().issue_tokens(admin_user)

    response = client.post(
        "/api/auth/refresh", {"refresh": refresh}, content_type="application/json"
    )

    assert response.status_code == 200
    assert response.json()["access"]


@pytest.mark.django_db
def test_refresh_rejects_garbage(client):
    response = client.post(
        "/api/auth/refresh", {"refresh": "not-a-token"}, content_type="application/json"
    )

    assert response.status_code == 403
    assert response.json()["code"] == "invalid_refresh"


@pytest.mark.django_db
def test_seed_command_refuses_with_debug_false():
    from django.core.management import call_command
    from django.core.management.base import CommandError

    # No settings override here: Django's test runner already forces
    # DEBUG=False for the whole session, which is exactly the condition
    # this command must refuse to run under.
    with pytest.raises(CommandError):
        call_command("seed_local_users")

    assert UserProfile.objects.count() == 0


@pytest.mark.django_db
def test_seed_command_creates_one_user_per_role(settings):
    # Django's test runner forces settings.DEBUG = False for every test
    # session regardless of what config/settings/test.py says (see
    # django.test.utils.setup_test_environment), so exercising a command
    # that is gated on DEBUG needs an explicit per-test override here.
    settings.DEBUG = True
    from django.core.management import call_command

    call_command("seed_local_users")

    assert UserProfile.objects.count() == 3
    assert sorted(UserProfile.objects.values_list("role", flat=True)) == [
        "ADMIN",
        "CONSULTANT",
        "ENGINEER",
    ]


@pytest.mark.django_db
def test_seed_command_is_idempotent(settings):
    settings.DEBUG = True
    from django.core.management import call_command

    call_command("seed_local_users")
    call_command("seed_local_users")

    assert User.objects.count() == 3
