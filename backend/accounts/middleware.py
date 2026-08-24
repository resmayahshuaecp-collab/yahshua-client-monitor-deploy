from django.http import HttpRequest, HttpResponse

from accounts.actor import Actor
from accounts.providers import get_provider


class ActorMiddleware:
    """Sets request.actor on every request.

    Never raises on a missing or bad credential -- it sets an anonymous
    Actor and lets the endpoint decide. An endpoint that needs identity
    says so with require_role; one that does not, like healthz, keeps
    working.
    """

    def __init__(self, get_response) -> None:
        self.get_response = get_response
        self.provider = get_provider()

    def __call__(self, request: HttpRequest) -> HttpResponse:
        result = self.provider.resolve(request)
        if result is None:
            request.actor = Actor.anonymous()
            request.auth_source = None
        else:
            request.actor = result.actor
            request.auth_source = result.source
        return self.get_response(request)
