from django.conf import settings
from django.utils.module_loading import import_string

from .base import AuthProvider, AuthResult

PROVIDERS: dict[str, str] = {
    "local": "accounts.providers.local.LocalAuthProvider",
}

__all__ = ["AuthProvider", "AuthResult", "PROVIDERS", "UnknownAuthProvider", "get_provider"]


class UnknownAuthProvider(RuntimeError):
    """AUTH_PROVIDER names a provider that does not exist.

    Raised rather than defaulting. An unknown identity provider that falls
    back to a working one authenticates against the wrong source without
    saying so.
    """


def get_provider() -> AuthProvider:
    name = settings.AUTH_PROVIDER
    try:
        dotted_path = PROVIDERS[name]
    except KeyError:
        raise UnknownAuthProvider(
            f"AUTH_PROVIDER={name!r} is not a known provider. Known providers: {sorted(PROVIDERS)}."
        ) from None
    return import_string(dotted_path)()
