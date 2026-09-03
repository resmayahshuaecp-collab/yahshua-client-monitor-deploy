from ninja import Router

from accounts.refusals import Refusal
from clients.models import Client
from concerns.models import Bug, Rsc, Meeting
from search.schemas import SearchOut

router = Router(tags=["search"])


@router.get("/", response=SearchOut, auth=None)
def search(request, q: str = ""):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")

    q = q.strip()
    results = []
    if not q:
        return {"results": results}

    for c in Client.objects.filter(name__icontains=q)[:5]:
        results.append({"type": "client", "id": c.id, "label": c.name,
                        "href": "/globe" if c.segment == "GLOBE" else "/sme"})

    for b in Bug.objects.filter(title__icontains=q)[:5]:
        results.append({"type": "bug", "id": b.id, "label": b.title, "href": "/bugs"})

    for r in Rsc.objects.filter(title__icontains=q)[:5]:
        results.append({"type": "rsc", "id": r.id, "label": r.title, "href": "/rsc"})

    for m in Meeting.objects.filter(title__icontains=q)[:5]:
        results.append({"type": "meeting", "id": m.id, "label": m.title, "href": "/meetings"})

    return {"results": results}