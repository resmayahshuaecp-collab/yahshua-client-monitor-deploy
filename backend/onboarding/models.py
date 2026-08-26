from django.db import models


class ResourceType(models.TextChoices):
    VIDEO = "VIDEO", "Training Video"
    MATERIAL = "MATERIAL", "Training Material"


class TrainingResource(models.Model):
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=10, choices=ResourceType.choices)
    description = models.TextField(blank=True)
    url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} ({self.resource_type})"