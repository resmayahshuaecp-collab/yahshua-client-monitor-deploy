from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from concerns.models import Meeting

SEEDS = [
    ("Globe onboarding call", "Kickoff with new Globe client.", 2),
    ("SME contract review", "Review upcoming contract renewal.", 4),
    ("Bug triage meeting", "Discuss open high-priority bugs.", 1),
    ("Quarterly delivery sync", "Team sync on delivery status.", 7),
]


class Command(BaseCommand):
    help = "Create sample meetings for development. Idempotent."

    def handle(self, *args, **options):
        now = timezone.now()
        for title, desc, days_ahead in SEEDS:
            obj, created = Meeting.objects.get_or_create(
                title=title,
                defaults={
                    "description": desc,
                    "scheduled_for": now + timedelta(days=days_ahead),
                },
            )
            self.stdout.write(f"{'created' if created else 'exists'} {title}")