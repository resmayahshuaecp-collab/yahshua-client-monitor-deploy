from ninja import Router

from accounts.csrf import enforce_csrf_for_cookie_auth
from accounts.refusals import Refusal
from concerns.models import Bug
from concerns.schemas import BugOut, BugIn, BugUpdateIn

router = Router(tags=["concerns"])


def _get_or_refuse_bug(bug_id: int) -> Bug:
    try:
        return Bug.objects.get(pk=bug_id)
    except Bug.DoesNotExist:
        raise Refusal("not_found", "No bug with that id.") from None


@router.get("/bugs", response=list[BugOut], auth=None)
def list_bugs(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return Bug.objects.all()


@router.post("/bugs", response=BugOut, auth=None)
def create_bug(request, payload: BugIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return Bug.objects.create(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
    )


@router.put("/bugs/{bug_id}", response=BugOut, auth=None)
def update_bug(request, bug_id: int, payload: BugUpdateIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    bug = _get_or_refuse_bug(bug_id)
    if payload.status is not None:
        bug.status = payload.status
    if payload.priority is not None:
        bug.priority = payload.priority
    bug.save()
    return bug