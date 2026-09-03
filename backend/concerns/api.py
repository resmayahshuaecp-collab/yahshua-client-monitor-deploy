from datetime import timedelta
from clients.models import Client
import logging

from django.utils import timezone
from django.db.models import Q
from ninja import Router

from accounts.csrf import enforce_csrf_for_cookie_auth
from accounts.refusals import Refusal
from concerns.models import Bug, Meeting, Rsc
from concerns.schemas import (
    BugOut, BugIn, BugUpdateIn,
    RscOut, RscIn, RscUpdateIn,
    MeetingOut, MeetingIn,
    ConcernStatsOut,
    BugReportSummary,
    RscReportSummary,
    NotificationsOut,
)

logger = logging.getLogger(__name__)
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


@router.get("/bugs/summary", response=BugReportSummary, auth=None)
def bug_report_summary(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    total = Bug.objects.count()
    open_count = Bug.objects.filter(status="OPEN").count()
    in_progress = Bug.objects.filter(status="IN_PROGRESS").count()
    resolved = Bug.objects.filter(status="RESOLVED").count()
    
    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "resolved": resolved,
    }


@router.get("/bugs/top-open", response=list[BugOut], auth=None)
def top_open_bugs(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    # Priority ordering: HIGH=0, MEDIUM=1, LOW=2
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    
    open_bugs = Bug.objects.filter(~Q(status="RESOLVED")).order_by("-updated_at")
    
    # Sort by priority (HIGH first) then by updated_at (newest first)
    sorted_bugs = sorted(
        open_bugs,
        key=lambda b: (priority_order.get(b.priority, 999), -b.updated_at.timestamp())
    )
    
    return sorted_bugs[:5]


@router.post("/bugs", response=BugOut, auth=None)
def create_bug(request, payload: BugIn):
    logger.debug(f"create_bug: method={request.method}, auth_source={getattr(request, 'auth_source', None)}, actor={request.actor}")
    enforce_csrf_for_cookie_auth(request)
    logger.debug(f"create_bug: CSRF check passed, actor.is_authenticated={request.actor.is_authenticated}")
    
    if not request.actor.is_authenticated:
        logger.warning(f"create_bug: Request not authenticated")
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    try:
        logger.debug(f"create_bug: Creating bug with title={payload.title}, priority={payload.priority}")
        return Bug.objects.create(
            title=payload.title,
            description=payload.description or "",
            priority=payload.priority,
            status="OPEN",
        )
    except Exception as e:
        logger.error(f"create_bug: Exception creating bug: {str(e)}")
        raise Refusal("creation_failed", f"Failed to create bug: {str(e)}") from e


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


@router.get("/rsc/summary", response=RscReportSummary, auth=None)
def rsc_report_summary(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    total = Rsc.objects.count()
    open_count = Rsc.objects.filter(status="OPEN").count()
    in_progress = Rsc.objects.filter(status="IN_PROGRESS").count()
    completed = Rsc.objects.filter(status="COMPLETED").count()
    
    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "completed": completed,
    }


@router.get("/rsc/top-open", response=list[RscOut], auth=None)
def top_open_rsc(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    # Priority ordering: HIGH=0, MEDIUM=1, LOW=2
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    
    open_rsc = Rsc.objects.filter(~Q(status="COMPLETED")).order_by("-updated_at")
    
    # Sort by priority (HIGH first) then by updated_at (newest first)
    sorted_rsc = sorted(
        open_rsc,
        key=lambda r: (priority_order.get(r.priority, 999), -r.updated_at.timestamp())
    )
    
    return sorted_rsc[:5]


@router.get("/stats", response=ConcernStatsOut, auth=None)
def concern_stats(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")

    open_bugs = Bug.objects.exclude(status="RESOLVED").count()
    open_rsc = Rsc.objects.exclude(status="COMPLETED").count()

    now = timezone.now()
    week_end = now + timedelta(days=7)
    meetings_this_week = Meeting.objects.filter(
        scheduled_for__gte=now,
        scheduled_for__lte=week_end,
    ).count()

    return {
        "open_concerns": open_bugs + open_rsc,
        "meetings_this_week": meetings_this_week,
        "total_bugs": Bug.objects.count(),
        "total_rsc": Rsc.objects.count(),
        "total_meetings": Meeting.objects.count(),
    }


@router.post("/rsc", response=RscOut, auth=None)
def create_rsc(request, payload: RscIn):
    enforce_csrf_for_cookie_auth(request)
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    
    try:
        return Rsc.objects.create(
            title=payload.title,
            description=payload.description or "",
            priority=payload.priority,
            status="OPEN",
        )
    except Exception as e:
        raise Refusal("creation_failed", f"Failed to create RSC request: {str(e)}") from e


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


@router.get("/notifications", response=NotificationsOut, auth=None)
def notifications(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")

    items = []

    for b in Bug.objects.exclude(status="RESOLVED")[:5]:
        items.append({"type": "concern", "label": f"Open bug: {b.title}", "href": "/bugs"})

    for r in Rsc.objects.exclude(status="COMPLETED")[:5]:
        items.append({"type": "concern", "label": f"Open RSC: {r.title}", "href": "/rsc"})

    now = timezone.now()
    week_end = now + timedelta(days=7)
    for m in Meeting.objects.filter(scheduled_for__gte=now, scheduled_for__lte=week_end)[:5]:
        items.append({"type": "meeting", "label": f"Meeting: {m.title}", "href": "/meetings"})

    for c in Client.objects.all():
        if c.status == "EXPIRING_SOON":
            items.append({
                "type": "contract",
                "label": f"Contract expiring: {c.name}",
                "href": "/globe" if c.segment == "GLOBE" else "/sme",
            })

    return {"count": len(items), "items": items}