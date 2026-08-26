from django.core.management.base import BaseCommand

from onboarding.models import TrainingResource, ResourceType

SEEDS = [
    ("YBO Platform Overview", ResourceType.VIDEO, "Intro to the YBO system and its core modules.", "https://example.com/videos/ybo-overview"),
    ("Invoicing Module Walkthrough", ResourceType.VIDEO, "How to use the invoicing features.", "https://example.com/videos/invoicing"),
    ("Client Setup Tutorial", ResourceType.VIDEO, "Step-by-step client onboarding in YBO.", "https://example.com/videos/client-setup"),
    ("YBO User Manual (PDF)", ResourceType.MATERIAL, "Full reference manual for YBO features.", "https://example.com/docs/ybo-manual"),
    ("Quick Start Guide", ResourceType.MATERIAL, "One-page getting-started checklist.", "https://example.com/docs/quick-start"),
    ("System Customization FAQ", ResourceType.MATERIAL, "Common customization requests answered.", "https://example.com/docs/customization-faq"),
]


class Command(BaseCommand):
    help = "Create sample training resources for development. Idempotent."

    def handle(self, *args, **options):
        for title, rtype, desc, url in SEEDS:
            obj, created = TrainingResource.objects.get_or_create(
                title=title,
                defaults={"resource_type": rtype, "description": desc, "url": url},
            )
            self.stdout.write(f"{'created' if created else 'exists'} {title} ({rtype})")