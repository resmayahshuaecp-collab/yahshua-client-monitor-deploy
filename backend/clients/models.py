from datetime import timedelta

from django.db import models
from django.utils import timezone


class Segment(models.TextChoices):
    GLOBE = "GLOBE", "Globe"
    SME = "SME", "SME"


class Client(models.Model):
    EXPIRING_SOON_DAYS = 30

    name = models.CharField(max_length=255)
    segment = models.CharField(max_length=10, choices=Segment.choices)
    contract_start = models.DateField()
    contract_end = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.segment})"

    @property
    def status(self):
        today = timezone.localdate()
        if self.contract_end < today:
            return "EXPIRED"
        if self.contract_end <= today + timedelta(days=self.EXPIRING_SOON_DAYS):
            return "EXPIRING_SOON"
        return "ACTIVE"