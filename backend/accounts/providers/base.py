from dataclasses import dataclass
from typing import Protocol

from django.http import HttpRequest

from accounts.actor import Actor


@dataclass(frozen=True)
class AuthResult:
    """A resolved identity plus where its credential came from.

    `source` matters because CSRF only applies to the cookie path: a
    cookie is sent by the browser automatically, a bearer header is not.
    See accounts/csrf.py.
    """

    actor: Actor
    source: str  # "header" or "cookie"


class AuthProvider(Protocol):
    """Resolves a request to an Actor.

    There is one implementation today, LocalAuthProvider, which reads a
    ninja-jwt token issued by this service.

    The intended second implementation is a HostAuthProvider, for when this
    tool moves behind Host. It would read the identity Host forwards --
    its signed session or forwarded header -- and map Host's user and role
    onto an Actor, so that no view changes. It is deliberately not written
    yet; `AUTH_PROVIDER=host` raises UnknownAuthProvider rather than
    quietly using the local provider.
    """

    def resolve(self, request: HttpRequest) -> AuthResult | None:
        """Return the resolved identity, or None if the request carries none."""
        ...
