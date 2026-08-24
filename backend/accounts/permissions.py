from accounts.actor import Actor
from accounts.refusals import Refusal


def require_role(actor: Actor, *allowed: str) -> None:
    """Refuse unless the actor holds one of `allowed`.

    Three separate refusals on purpose: "you are not logged in", "your
    account has no role" and "your role cannot do this" are different
    problems with different fixes, and collapsing them into one 403 sends
    whoever is debugging down the wrong path.
    """
    if not actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    if actor.role is None:
        raise Refusal("no_role", "This account has no role assigned.")
    if actor.role not in allowed:
        raise Refusal(
            "role_not_permitted",
            f"Role {actor.role} is not permitted here.",
        )


def has_role(actor: Actor, *allowed: str) -> bool:
    try:
        require_role(actor, *allowed)
    except Refusal:
        return False
    return True
