from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET

# Plain Django view, not a ninja route: ensure_csrf_cookie wraps a view that
# returns a real HttpResponse and runs its own response-phase logic on it
# (see django.views.decorators.csrf.ensure_csrf_cookie). django-ninja never
# hands the decorator that HttpResponse -- it takes the view's return value
# and serializes it itself -- so this endpoint sits outside the ninja router
# even though it is mounted at the same /api/auth/ prefix as the others.
#
# No auth requirement: a visitor must be able to get a CSRF cookie before
# they have logged in at all.


@require_GET
@ensure_csrf_cookie
def csrf(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"ok": True})
