from django.contrib import admin
from django.urls import path
from ninja_extra import NinjaExtraAPI

from accounts.api import router as auth_router
from core.api_errors import register_refusal_handler
from core.api_health import healthz

api = NinjaExtraAPI(title="YAHSHUA Client Monitor API", version="1.0.0")
register_refusal_handler(api)
api.add_router("/auth", auth_router)

urlpatterns = [
    path("healthz", healthz),
    path("api/", api.urls),
    path("admin/", admin.site.urls),
]
