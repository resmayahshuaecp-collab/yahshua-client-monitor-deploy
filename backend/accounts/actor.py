from dataclasses import dataclass


@dataclass(frozen=True)
class Actor:
    """Who is making this request.

    This is the ONLY identity type feature code reads. Nothing outside
    accounts/ may import django.contrib.auth.User or call
    get_user_model() -- that rule is what lets the identity source be
    swapped (for example to Host) by writing one new AuthProvider instead
    of editing every view.
    """

    user_id: int | None
    email: str
    name: str
    role: str | None
    is_authenticated: bool

    @classmethod
    def anonymous(cls) -> "Actor":
        return cls(user_id=None, email="", name="", role=None, is_authenticated=False)
