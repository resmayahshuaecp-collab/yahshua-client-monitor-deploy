import sys
import os

# Debug: print where we are
print("__file__:", __file__)
print("cwd:", os.getcwd())
print("listdir cwd:", os.listdir(os.getcwd()))

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
print("backend_dir:", backend_dir)
print("listdir backend_dir:", os.listdir(backend_dir))

sys.path.insert(0, backend_dir)
sys.path.insert(0, os.getcwd())

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

try:
    import django
    django.setup()
    print("Django setup OK")
except Exception as e:
    print(f"Django setup error: {e}")

from django.core.management import call_command

try:
    call_command("migrate", "--no-input")
except Exception as e:
    print(f"Migration error: {e}")

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