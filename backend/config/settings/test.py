from .base import *  # noqa: F403

DEBUG = True  # seed_local_users refuses to run with DEBUG=False
ALLOWED_HOSTS = ["testserver", "localhost"]
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
