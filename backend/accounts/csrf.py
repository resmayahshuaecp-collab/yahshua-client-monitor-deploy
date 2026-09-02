from django.conf import settings
from django.http import HttpRequest
from django.middleware.csrf import CsrfViewMiddleware
import logging

from accounts.refusals import Refusal

logger = logging.getLogger(__name__)
UNSAFE_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})


class _Enforcer(CsrfViewMiddleware):
    """Reuses Django's CSRF logic instead of reimplementing it.

    `process_view` is called directly (not through the middleware chain),
    so its return value -- a 403 HttpResponse on rejection, None on accept
    -- is never inspected by anything. That would silently let a rejection
    through. `_reject` is still the single hook `process_view` calls on
    every rejection path in Django 5.2 (verified by reading
    django.middleware.csrf.CsrfViewMiddleware.process_view), so overriding
    it to raise instead of returning a response is what makes the
    rejection actually observable here.
    """

    def _reject(self, request, reason):
        logger.warning(f"CSRF rejected: {reason}")
        raise Refusal("csrf_failed", f"CSRF verification failed: {reason}")


def enforce_csrf_for_cookie_auth(request: HttpRequest) -> None:
    """Require a CSRF token, but only when the credential came from a cookie.

    A cookie is attached by the browser to any request an attacker's page
    can cause, which is exactly what CSRF defends against. A bearer header
    is not, so requiring a token on the header path would buy no safety and
    would break curl and server-to-server callers.
    
    In DEBUG mode, CSRF checks are relaxed to allow development without
    strict token validation.
    """
    logger.debug(f"enforce_csrf_for_cookie_auth: method={request.method}, auth_source={getattr(request, 'auth_source', None)}, DEBUG={settings.DEBUG}")
    
    if request.method not in UNSAFE_METHODS:
        logger.debug(f"enforce_csrf_for_cookie_auth: Skipping for {request.method}")
        return
    if getattr(request, "auth_source", None) != "cookie":
        logger.debug(f"enforce_csrf_for_cookie_auth: Skipping for non-cookie auth")
        return

    # In development, allow requests without CSRF token
    if settings.DEBUG:
        logger.debug(f"enforce_csrf_for_cookie_auth: Skipping CSRF check in DEBUG mode")
        return

    logger.debug(f"enforce_csrf_for_cookie_auth: Performing CSRF check")
    enforcer = _Enforcer(lambda r: None)
    enforcer.process_request(request)
    enforcer.process_view(request, lambda r: None, (), {})
