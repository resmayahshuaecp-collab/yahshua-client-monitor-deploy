from django.conf import settings
from django.db import models


class Role(models.TextChoices):
    """The three roles the tool distinguishes.

    A plain choices field rather than Django Groups: the set is small and
    fixed, and if identity later comes from Host these values have to be
    mapped from Host's roles anyway -- which is a mapping table, not a
    permissions system.
    """

    ADMIN = "ADMIN", "Admin"
    CONSULTANT = "CONSULTANT", "Consultant"
    ENGINEER = "ENGINEER", "System Engineer"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    role = models.CharField(max_length=16, choices=Role.choices)
    display_name = models.CharField(max_length=150, blank=True)

    def __str__(self) -> str:
        return f"{self.user_id}:{self.role}"
