from django.core.management.base import BaseCommand

from messaging.models import Conversation, ConversationType


CONVERSATION_TYPES = [
    ConversationType.GLOBE_CHAT,
    ConversationType.SME_CHAT,
    ConversationType.CONSULTANT_CHANNEL,
    ConversationType.ENGINEER_CHANNEL,
]


class Command(BaseCommand):
    help = "Create initial conversations for each channel. Idempotent."

    def handle(self, *args, **options):
        for conv_type in CONVERSATION_TYPES:
            conversation, created = Conversation.objects.get_or_create(
                type=conv_type,
            )
            self.stdout.write(
                f"{'created' if created else 'exists'} {conversation.get_type_display()}"
            )
