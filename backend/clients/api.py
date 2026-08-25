from ninja import Router

from accounts.refusals import Refusal
from clients.models import Client
from clients.schemas import ClientOut

router = Router(tags=["clients"])


@router.get("/", response=list[ClientOut], auth=None)
def list_clients(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return Client.objects.all()