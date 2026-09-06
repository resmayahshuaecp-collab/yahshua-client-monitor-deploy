import csv
import io
from datetime import date

from ninja import File, Router
from ninja.files import UploadedFile

from accounts.csrf import enforce_csrf_for_cookie_auth
from accounts.models import Role
from accounts.permissions import require_role
from accounts.refusals import Refusal
from clients.models import Client
from clients.schemas import ClientIn, ClientOut, ClientStatsOut, ContractReportSummary

router = Router(tags=["clients"])


def _get_or_refuse(client_id: int) -> Client:
    try:
        return Client.objects.get(pk=client_id)
    except Client.DoesNotExist:
        raise Refusal("not_found", "No client with that id.") from None


@router.get("", response=list[ClientOut], auth=None)
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


@router.get("/contracts/summary", response=ContractReportSummary, auth=None)
def contract_report_summary(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")

    clients = list(Client.objects.all())
    active = sum(c.status == "ACTIVE" for c in clients)
    expiring_soon = sum(c.status == "EXPIRING_SOON" for c in clients)
    expired = sum(c.status == "EXPIRED" for c in clients)

    return {
        "total": len(clients),
        "active": active,
        "expiring_soon": expiring_soon,
        "expired": expired,
    }


@router.post("", response=ClientOut, auth=None)
def create_client(request, payload: ClientIn):
    enforce_csrf_for_cookie_auth(request)
    require_role(request.actor, Role.ADMIN)
    return Client.objects.create(**payload.dict())


@router.post("/import", response={200: dict}, auth=None)
def import_clients(request, file: UploadedFile = File(...)):
    enforce_csrf_for_cookie_auth(request)
    require_role(request.actor, Role.ADMIN)

    try:
        decoded = file.read().decode("utf-8-sig")
    except UnicodeDecodeError:
        raise Refusal("bad_file", "That file isn't valid UTF-8 text.") from None

    reader = csv.DictReader(io.StringIO(decoded))
    required = {"name", "segment", "contract_start", "contract_end"}
    if not required.issubset({(h or "").strip() for h in (reader.fieldnames or [])}):
        raise Refusal(
            "bad_columns",
            "CSV must have columns: name, segment, contract_start, contract_end.",
        )

    existing = {n.lower() for n in Client.objects.values_list("name", flat=True)}
    created = 0
    skipped = 0
    errors = []

    for line_no, row in enumerate(reader, start=2):
        name = (row.get("name") or "").strip()
        segment = (row.get("segment") or "").strip().upper()
        start = (row.get("contract_start") or "").strip()
        end = (row.get("contract_end") or "").strip()

        if not name:
            errors.append(f"Row {line_no}: missing name.")
            continue
        if name.lower() in existing:
            skipped += 1
            continue
        if segment not in {"GLOBE", "SME"}:
            errors.append(f"Row {line_no}: segment must be GLOBE or SME.")
            continue
        try:
            start_date = date.fromisoformat(start)
            end_date = date.fromisoformat(end)
        except ValueError:
            errors.append(f"Row {line_no}: dates must be YYYY-MM-DD.")
            continue

        Client.objects.create(
            name=name,
            segment=segment,
            contract_start=start_date,
            contract_end=end_date,
        )
        existing.add(name.lower())
        created += 1

    return {"created": created, "skipped": skipped, "errors": errors}


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