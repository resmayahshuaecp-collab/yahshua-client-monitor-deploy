from django.db import connection
from django.http import HttpRequest, JsonResponse


def healthz(request: HttpRequest) -> JsonResponse:
    """Liveness plus a real database round trip.

    A health check that does not touch the database reports ok while every
    request 500s, which is worse than no health check at all.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return JsonResponse({"status": "degraded", "database": "unreachable"}, status=503)

    return JsonResponse({"status": "ok", "database": "ok"})
