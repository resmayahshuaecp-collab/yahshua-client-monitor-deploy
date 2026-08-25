from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from clients.models import Client, Segment

# (name, segment, days_until_expiry) — negative = already expired
SEEDS = [
    ("De Vicente Group", Segment.GLOBE, 90),
    ("MANYIP Corporation", Segment.GLOBE, 12),
    ("CRT Agri Supply", Segment.GLOBE, 5),
    ("Northwind Trading", Segment.GLOBE, 200),
    ("Sunrise Logistics", Segment.GLOBE, -10),
    ("Metro Hardware Co", Segment.GLOBE, 45),
    ("Pacific Foods Inc", Segment.SME, 150),
    ("Cebu Craft Bakery", Segment.SME, 20),
    ("Rivera Dental Clinic", Segment.SME, 8),
    ("GreenLeaf Nursery", Segment.SME, 300),
    ("Downtown Auto Parts", Segment.SME, -30),
    ("Lakeside Cafe", Segment.SME, 60),
]


class Command(BaseCommand):
    help = "Create sample clients for development. Idempotent."

    def handle(self, *args, **options):
        today = timezone.localdate()
        for name, segment, days in SEEDS:
            end = today + timedelta(days=days)
            start = end - timedelta(days=365)
            client, created = Client.objects.get_or_create(
                name=name,
                defaults={
                    "segment": segment,
                    "contract_start": start,
                    "contract_end": end,
                },
            )
            self.stdout.write(
                f"{'created' if created else 'exists'} {name} "
                f"({segment}) -> {client.status}"
            )