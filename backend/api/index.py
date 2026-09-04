import sys
import os

# Get the backend directory (parent of api/)
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

import django
django.setup()

from django.core.management import call_command

# Run migrations
try:
    call_command("migrate", "--no-input")
except Exception as e:
    print(f"Migration error: {e}")

# Create admin user
try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(username="admin@example.com").exists():
        User.objects.create_superuser(
            username="admin@example.com",
            email="admin@example.com",
            password="Admin2026"
        )
except Exception as e:
    print(f"User creation error: {e}")

# Seed data
try:
    from clients.models import Client
    if Client.objects.count() == 0:
        call_command("seed_clients")
        call_command("seed_conversations")
        call_command("seed_bugs")
        call_command("seed_rsc")
        call_command("seed_meetings")
        call_command("seed_resources")
except Exception as e:
    print(f"Seed error: {e}")

from config.wsgi import application
app = application