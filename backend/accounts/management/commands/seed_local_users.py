from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from accounts.models import Role, UserProfile

User = get_user_model()

SEEDS = [
    ("admin@example.com", Role.ADMIN, "Ada Admin"),
    ("consultant@example.com", Role.CONSULTANT, "Rina Consultant"),
    ("engineer@example.com", Role.ENGINEER, "Dan Engineer"),
]
PASSWORD = "pw-12345678"


class Command(BaseCommand):
    help = "Create one local user per role for development. Idempotent."

    def handle(self, *args, **options):
        if not settings.DEBUG:
            # Seeded accounts with a published password must never exist
            # outside development. Unconditional on purpose: gating this
            # on AUTH_PROVIDER as well would let the same command bypass
            # the DEBUG check simply by that setting being non-local.
            raise CommandError("Refusing to seed users with DEBUG=False.")

        for email, role, name in SEEDS:
            user, created = User.objects.get_or_create(username=email, defaults={"email": email})
            if created:
                user.set_password(PASSWORD)
                user.save(update_fields=["password"])
            UserProfile.objects.update_or_create(
                user=user, defaults={"role": role, "display_name": name}
            )
            self.stdout.write(f"{'created' if created else 'updated'} {email} ({role})")
