from django.contrib import admin
from django.urls import path
from ninja_extra import NinjaExtraAPI

from core.api_health import healthz

api = NinjaExtraAPI(title="YAHSHUA Client Monitor API", version="1.0.0")

urlpatterns = [
    path("healthz", healthz),
    path("api/", api.urls),
    path("admin/", admin.site.urls),
]
