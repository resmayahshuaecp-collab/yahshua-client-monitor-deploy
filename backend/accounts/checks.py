from django.conf import settings
from django.core.checks import Error, register


@register()
def check_auth_provider_is_known(app_configs, **kwargs):
    """Refuse to start on an unknown AUTH_PROVIDER.

    A typo here would otherwise surface as "nobody can log in" at runtime,
    or worse, as a silent fallback to the wrong identity source.
    """
    from accounts.providers import PROVIDERS

    name = getattr(settings, "AUTH_PROVIDER", None)
    if name in PROVIDERS:
        return []
    return [
        Error(
            f"AUTH_PROVIDER={name!r} is not a known provider.",
            hint=f"Set AUTH_PROVIDER to one of: {sorted(PROVIDERS)}.",
            id="accounts.E001",
        )
    ]
