from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# WhiteNoise scans STATIC_ROOT once at startup and warns for every request
# when it is absent -- which it always is outside a container, since nothing
# runs collectstatic locally. Autorefresh is WhiteNoise's documented
# development setting: it looks files up per request instead of caching a
# manifest at boot.
WHITENOISE_AUTOREFRESH = True
