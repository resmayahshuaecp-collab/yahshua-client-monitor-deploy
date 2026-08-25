from ninja import Router

from accounts.csrf import enforce_csrf_for_cookie_auth
from accounts.models import Role
from accounts.permissions import require_role
from accounts.refusals import Refusal
from clients.models import Client
from clients.schemas import ClientIn, ClientOut
from clients.schemas import ClientIn, ClientOut, ClientStatsOut

router = Router(tags=["clients"])


def _get_or_refuse(client_id: int) -> Client:
    try:
        return Client.objects.get(pk=client_id)
    except Client.DoesNotExist:
        raise Refusal("not_found", "No client with that id.") from None


@router.get("/", response=list[ClientOut], auth=None)
def list_clients(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return Client.objects.all()

@router.get("/stats", response=ClientStatsOut, auth=None)
def client_stats(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    clients = list(Client.objects.all())
    return {
        "total": len(clients),
        "globe": sum(c.segment == "GLOBE" for c in clients),
        "sme": sum(c.segment == "SME" for c in clients),
        "active_contracts": sum(c.status == "ACTIVE" for c in clients),
    }

@router.post("/", response=ClientOut, auth=None)
def create_client(request, payload: ClientIn):
    enforce_csrf_for_cookie_auth(request)
    require_role(request.actor, Role.ADMIN)
    return Client.objects.create(**payload.dict())


@router.put("/{client_id}", response=ClientOut, auth=None)
def update_client(request, client_id: int, payload: ClientIn):
    enforce_csrf_for_cookie_auth(request)
    require_role(request.actor, Role.ADMIN)
    client = _get_or_refuse(client_id)
    for field, value in payload.dict().items():
        setattr(client, field, value)
    client.save()
    return client


@router.delete("/{client_id}", response={200: dict}, auth=None)
def delete_client(request, client_id: int):
    enforce_csrf_for_cookie_auth(request)
    require_role(request.actor, Role.ADMIN)
    client = _get_or_refuse(client_id)
    client.deleted = client.delete()
    return {"ok": True}