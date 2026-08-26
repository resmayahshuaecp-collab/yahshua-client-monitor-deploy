from ninja import Router

from accounts.refusals import Refusal
from onboarding.models import TrainingResource
from onboarding.schemas import TrainingResourceOut

router = Router(tags=["onboarding"])


@router.get("/resources", response=list[TrainingResourceOut], auth=None)
def list_resources(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return TrainingResource.objects.all()