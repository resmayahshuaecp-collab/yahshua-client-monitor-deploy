import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

import django
django.setup()

# Run migrations on startup
from django.core.management import call_command
try:
    call_command("migrate", "--no-input")
except Exception as e:
    print(f"Migration error: {e}")

from config.wsgi import application
app = application