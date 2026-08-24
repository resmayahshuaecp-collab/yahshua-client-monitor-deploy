from .base import *  # noqa: F403

# Django's test runner forces settings.DEBUG = False for the whole session
# regardless of what is set here (see django.test.utils.setup_test_environment),
# so this must stay False to match reality. Tests that exercise
# seed_local_users (which refuses to run with DEBUG=False) carry an explicit
# per-test `settings.DEBUG = True` override instead -- see
# accounts/tests/test_auth_api.py.
DEBUG = False
ALLOWED_HOSTS = ["testserver", "localhost"]
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# WhiteNoise scans STATIC_ROOT once at startup and warns for every request
# when it is absent -- which it always is outside a container, since nothing
# runs collectstatic locally. Autorefresh is WhiteNoise's documented
# development setting: it looks files up per request instead of caching a
# manifest at boot.
WHITENOISE_AUTOREFRESH = True
