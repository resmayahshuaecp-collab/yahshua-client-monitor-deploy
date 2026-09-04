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

# Seed data if empty
try:
    from clients.models import Client
    if Client.objects.count() == 0:
        call_command("seed_clients")
        call_command("seed_conversations")
        call_command("seed_bugs")
        call_command("seed_rsc")
        call_command("seed_meetings")
        call_command("seed_resources")
        print("Seed data created")
except Exception as e:
    print(f"Seed error: {e}")

from config.wsgi import application
app = application