from django.contrib import admin
from django.urls import path
from ninja_extra import NinjaExtraAPI

from accounts.api import router as auth_router
from accounts.views import csrf as csrf_view
from clients.api import router as clients_router
from messaging.api import router as messaging_router
from core.api_errors import register_refusal_handler
from core.api_health import healthz
from onboarding.api import router as onboarding_router
from concerns.api import router as concerns_router

api = NinjaExtraAPI(title="YAHSHUA Client Monitor API", version="1.0.0")
register_refusal_handler(api)
api.add_router("/auth", auth_router)
api.add_router("/clients", clients_router)
api.add_router("/onboarding", onboarding_router)
api.add_router("/messaging", messaging_router)
api.add_router("/concerns", concerns_router)

urlpatterns = [
    path("healthz", healthz),
    # Ahead of "api/": a plain Django view (ensure_csrf_cookie needs to run
    # against a real HttpResponse, which ninja's own dispatch never produces
    # for the decorator to see -- see accounts/views.py), mounted at the same
    # /api/auth/ prefix as the ninja-routed auth endpoints.
    path("api/auth/csrf", csrf_view),
    path("api/", api.urls),
    path("admin/", admin.site.urls),
]