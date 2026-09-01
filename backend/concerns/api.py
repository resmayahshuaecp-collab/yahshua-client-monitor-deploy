from ninja import Router

from accounts.csrf import enforce_csrf_for_cookie_auth
from accounts.refusals import Refusal
from concerns.models import Bug
from concerns.schemas import BugOut, BugIn, BugUpdateIn
from concerns.models import Bug, Rsc
from concerns.schemas import BugOut, BugIn, BugUpdateIn, RscOut, RscIn, RscUpdateIn
from concerns.models import Bug, Rsc, Meeting
from concerns.schemas import (
    BugOut, BugIn, BugUpdateIn,
    RscOut, RscIn, RscUpdateIn,
    MeetingOut, MeetingIn,
)

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

def _get_or_refuse_rsc(rsc_id: int) -> Rsc:
    try:
        return Rsc.objects.get(pk=rsc_id)
    except Rsc.DoesNotExist:
        raise Refusal("not_found", "No RSC with that id.") from None


@router.get("/rsc", response=list[RscOut], auth=None)
def list_rsc(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return Rsc.objects.all()


@router.post("/rsc", response=RscOut, auth=None)
def create_rsc(request, payload: RscIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return Rsc.objects.create(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
    )


@router.put("/rsc/{rsc_id}", response=RscOut, auth=None)
def update_rsc(request, rsc_id: int, payload: RscUpdateIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    rsc = _get_or_refuse_rsc(rsc_id)
    if payload.status is not None:
        rsc.status = payload.status
    if payload.priority is not None:
        rsc.priority = payload.priority
    rsc.save()
    return rsc

@router.get("/meetings", response=list[MeetingOut], auth=None)
def list_meetings(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return Meeting.objects.all()


@router.post("/meetings", response=MeetingOut, auth=None)
def create_meeting(request, payload: MeetingIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return Meeting.objects.create(
        title=payload.title,
        description=payload.description,
        scheduled_for=payload.scheduled_for,
    )

def _get_or_refuse_meeting(meeting_id: int) -> Meeting:
    try:
        return Meeting.objects.get(pk=meeting_id)
    except Meeting.DoesNotExist:
        raise Refusal("not_found", "No meeting with that id.") from None


@router.delete("/meetings/{meeting_id}", response={200: dict}, auth=None)
def delete_meeting(request, meeting_id: int):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    meeting = _get_or_refuse_meeting(meeting_id)
    meeting.delete()
    return {"ok": True}