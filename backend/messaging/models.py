from django.conf import settings
from django.db import models


class ConversationType(models.TextChoices):
    """Conversation channel types."""
    GLOBE_CHAT = "GLOBE_CHAT", "Globe Group Chat"
    SME_CHAT = "SME_CHAT", "SME Group Chat"
    CONSULTANT_CHANNEL = "CONSULTANT_CHANNEL", "Consultant Channel"
    ENGINEER_CHANNEL = "ENGINEER_CHANNEL", "System Engineer Channel"


class Conversation(models.Model):
    """A conversation represents a channel or group chat."""
    type = models.CharField(max_length=32, choices=ConversationType.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = ["type"]

    def __str__(self):
        return f"{self.get_type_display()}"


class Message(models.Model):
    """A message in a conversation."""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="messages_sent"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation", "-created_at"]),
            models.Index(fields=["sender", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.sender} @ {self.created_at}: {self.text[:50]}"
