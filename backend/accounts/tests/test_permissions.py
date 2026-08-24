import pytest

from accounts.actor import Actor
from accounts.models import Role
from accounts.permissions import has_role, require_role
from accounts.refusals import Refusal


def actor_with(role):
    return Actor(user_id=1, email="a@b.c", name="A", role=role, is_authenticated=True)


def test_allowed_role_passes():
    require_role(actor_with(Role.ADMIN), Role.ADMIN, Role.ENGINEER)


def test_disallowed_role_is_refused():
    with pytest.raises(Refusal) as excinfo:
        require_role(actor_with(Role.CONSULTANT), Role.ADMIN)

    assert excinfo.value.code == "role_not_permitted"


def test_actor_with_no_role_is_refused_not_defaulted():
    # A user whose profile is missing has role=None. Treating that as any
    # default role would hand out access nobody granted.
    with pytest.raises(Refusal) as excinfo:
        require_role(actor_with(None), Role.CONSULTANT)

    assert excinfo.value.code == "no_role"


def test_anonymous_actor_is_refused():
    with pytest.raises(Refusal) as excinfo:
        require_role(Actor.anonymous(), Role.ADMIN)

    assert excinfo.value.code == "not_authenticated"


def test_has_role_does_not_raise():
    assert has_role(actor_with(Role.ENGINEER), Role.ENGINEER) is True
    assert has_role(actor_with(Role.ENGINEER), Role.ADMIN) is False
    assert has_role(Actor.anonymous(), Role.ADMIN) is False
