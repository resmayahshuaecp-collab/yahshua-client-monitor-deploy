from django.core.management.base import BaseCommand

from concerns.models import Rsc, RscStatus, Priority

SEEDS = [
    ("Add filter by Customer Address (Town)", "Request to filter customers by town.", RscStatus.OPEN, Priority.HIGH),
    ("Add fields: Misc Trip Name / Pump No. / Project", "New fields for trip records.", RscStatus.OPEN, Priority.MEDIUM),
    ("Truck Profitability Report Enhancement", "Enhance the profitability report.", RscStatus.IN_PROGRESS, Priority.MEDIUM),
    ("Custom invoice template", "Client wants a branded invoice layout.", RscStatus.IN_PROGRESS, Priority.LOW),
    ("Bulk import for clients", "Allow CSV import of client records.", RscStatus.COMPLETED, Priority.HIGH),
    ("Dark mode option", "Add a dark theme.", RscStatus.COMPLETED, Priority.LOW),
]


class Command(BaseCommand):
    help = "Create sample RSC tickets for development. Idempotent."

    def handle(self, *args, **options):
        for title, desc, status, priority in SEEDS:
            obj, created = Rsc.objects.get_or_create(
                title=title,
                defaults={"description": desc, "status": status, "priority": priority},
            )
            self.stdout.write(f"{'created' if created else 'exists'} {title} ({status})")