from .base import *  # noqa: F403, F401
from .base import env

DEBUG = False
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

# No default on purpose. A production deploy missing this must refuse to
# start rather than boot with the development secret, which is public.
SECRET_KEY = env("DJANGO_SECRET_KEY")

# Defaults to on. The env var exists so a local smoke test of the production
# image can reach it over plain http -- there is no TLS terminator in front of
# a container on a laptop. Never set it false in a real deployment.
SECURE_SSL_REDIRECT = env.bool("DJANGO_SECURE_SSL_REDIRECT", default=True)

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Behind a load balancer that terminates TLS, every request reaches Django as
# plain http, so SECURE_SSL_REDIRECT would loop forever unless Django is told
# to read the proxy's header instead.
#
# OFF by default, and it must stay that way unless a proxy actually sets this
# header: any client can send X-Forwarded-Proto: https, so trusting it with
# nothing in front lets a plain-http request claim to be secure and silently
# defeats both the redirect and the secure-cookie flags.
if env.bool("DJANGO_TRUST_PROXY_SSL_HEADER", default=False):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CompressedManifestStaticFilesStorage fingerprints every file and refuses to
# serve one that collectstatic did not produce, so a missing asset fails at
# deploy time rather than 404-ing for a user. Production only: it would make
# the test suite depend on collectstatic having been run.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"
