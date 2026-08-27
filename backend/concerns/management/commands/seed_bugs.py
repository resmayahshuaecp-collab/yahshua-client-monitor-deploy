from django.core.management.base import BaseCommand

from concerns.models import Bug, BugStatus, Priority

SEEDS = [
    ("Price Level restriction error", "Price level not enforced on invoice.", BugStatus.OPEN, Priority.HIGH),
    ("Service Tab - Invoice save error", "Cannot save invoice from service tab.", BugStatus.OPEN, Priority.MEDIUM),
    ("Void approval not reflected in audit logs", "Voided entries missing from audit trail.", BugStatus.IN_PROGRESS, Priority.MEDIUM),
    ("Report export timeout", "Large reports time out on export.", BugStatus.IN_PROGRESS, Priority.LOW),
    ("Login session drops randomly", "Users logged out unexpectedly.", BugStatus.RESOLVED, Priority.HIGH),
    ("Typo on dashboard header", "Minor text typo.", BugStatus.RESOLVED, Priority.LOW),
]


class Command(BaseCommand):
    help = "Create sample bugs for development. Idempotent."

    def handle(self, *args, **options):
        for title, desc, status, priority in SEEDS:
            obj, created = Bug.objects.get_or_create(
                title=title,
                defaults={"description": desc, "status": status, "priority": priority},
            )
            self.stdout.write(f"{'created' if created else 'exists'} {title} ({status})")