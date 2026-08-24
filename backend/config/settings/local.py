from .base import *  # noqa: F403
from .base import env

DEBUG = True
# "backend" is the compose service name, not a hostname a browser would ever
# use. It is required for the containerized path: Next's route handlers run
# server-side inside the frontend container and reach Django by service DNS
# (BACKEND_ORIGIN=http://backend:8085 in docker-compose.yml), so Django sees
# Host: backend on every proxied request. Overridable via the environment so
# a deploy-shaped local run can narrow or extend the list without editing
# this file.
ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1", "backend", "0.0.0.0"]
)

# WhiteNoise scans STATIC_ROOT once at startup and warns for every request
# when it is absent -- which it always is outside a container, since nothing
# runs collectstatic locally. Autorefresh is WhiteNoise's documented
# development setting: it looks files up per request instead of caching a
# manifest at boot.
WHITENOISE_AUTOREFRESH = True
