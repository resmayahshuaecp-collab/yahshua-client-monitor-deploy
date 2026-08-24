# syntax=docker/dockerfile:1

# Two targets, selected with --target:
#   dev  -- source is bind-mounted, Django's autoreloader serves it
#   prod -- source is copied in, gunicorn serves it, runs as a non-root user
#
# The container listens on 8085, the same port the native workflow uses, so
# every instruction and every test that names a port stays true either way.

FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# No build toolchain on purpose: psycopg2-binary ships its own libpq, so
# nothing here needs compiling. Switching to plain psycopg2 would mean adding
# gcc and libpq-dev to this stage.


# --- dev ---------------------------------------------------------------
FROM base AS dev

# Requirements are copied alone so a source edit does not invalidate the
# dependency layer.
COPY requirements/ requirements/
RUN pip install -r requirements/local.txt

# Deliberately no `COPY . .` -- compose bind-mounts the source, so editing a
# file on the host reloads the server without a rebuild.

EXPOSE 8085
CMD ["python", "manage.py", "runserver", "0.0.0.0:8085"]


# --- prod --------------------------------------------------------------
FROM base AS prod

COPY requirements/ requirements/
RUN pip install -r requirements/production.txt

COPY . .

# Set BEFORE collectstatic, not after: manage.py defaults to
# config.settings.local, and collecting under local settings uses the plain
# storage backend and writes no staticfiles.json. Production's
# CompressedManifestStaticFilesStorage then raises "Missing staticfiles
# manifest entry" on the first admin page it renders.
#
# production.py also requires DJANGO_SECRET_KEY with no default and refuses
# to start without it -- see config/settings/production.py.
ENV DJANGO_SETTINGS_MODULE=config.settings.production

# Static files are collected at BUILD time so the image is self-contained and
# the container starts without a write step.
#
# These three values are throwaways that exist only for this command: settings
# import requires DATABASE_URL, and production.py requires DJANGO_SECRET_KEY
# with no default. They are scoped to this RUN and never reach the running
# container -- compose supplies the real ones.
RUN DATABASE_URL=postgres://collectstatic:collectstatic@localhost:5432/collectstatic \
    DJANGO_SECRET_KEY=collectstatic-build-step-only \
    DJANGO_ALLOWED_HOSTS=localhost \
    python manage.py collectstatic --noinput

# A container running as root shares uid 0 with the host. Fixed uid so a
# bind-mounted volume has predictable ownership.
RUN useradd --create-home --uid 10001 app && chown -R app:app /app
USER app

EXPOSE 8085
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8085", \
     "--workers", "3", \
     "--access-logfile", "-"]
