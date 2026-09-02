from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpRequest
from ninja_jwt.exceptions import TokenError
from ninja_jwt.settings import api_settings
from ninja_jwt.tokens import AccessToken, RefreshToken
import logging

from accounts.actor import Actor
from accounts.providers.base import AuthResult

logger = logging.getLogger(__name__)
User = get_user_model()


class LocalAuthProvider:
    """Resolves a ninja-jwt token this service issued.

    Reads the credential from the Authorization header first, then the
    access cookie. Both paths exist for a reason: the cookie is what lets
    the token stay httpOnly so no JavaScript ever touches it, and the
    header is what keeps the API usable from curl and from tests.
    """

    def resolve(self, request: HttpRequest) -> AuthResult | None:
        token, source = self._read_credential(request)
        logger.debug(f"LocalAuthProvider.resolve: token_found={bool(token)}, source={source}")
        
        if not token:
            return None

        try:
            payload = AccessToken(token)
            logger.debug(f"LocalAuthProvider.resolve: token decoded successfully")
        except TokenError as e:
            logger.debug(f"LocalAuthProvider.resolve: TokenError: {str(e)}")
            return None

        user_id = payload.get(api_settings.USER_ID_CLAIM)
        if user_id is None:
            logger.debug(f"LocalAuthProvider.resolve: No user_id in token")
            return None

        user = User.objects.filter(pk=user_id, is_active=True).select_related("profile").first()
        if user is None:
            logger.debug(f"LocalAuthProvider.resolve: User not found or inactive")
            return None

        logger.debug(f"LocalAuthProvider.resolve: User resolved: {user.email}")
        return AuthResult(actor=self.actor_for(user), source=source)

    def issue_tokens(self, user) -> tuple[str, str]:
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token), str(refresh)

    @staticmethod
    def _read_credential(request: HttpRequest) -> tuple[str | None, str]:
        header = request.META.get("HTTP_AUTHORIZATION", "")
        if header.startswith("Bearer "):
            return header.removeprefix("Bearer ").strip(), "header"
        cookie = request.COOKIES.get(settings.ACCESS_COOKIE_NAME)
        if cookie:
            return cookie, "cookie"
        return None, ""

    def actor_for(self, user) -> Actor:
        """Map a local Django user onto an Actor.

        Public (not `_to_actor`) because Task 5's login endpoint needs this
        exact mapping right after authenticating a user directly, before any
        token exists to resolve -- reaching across the module boundary into
        a private method there would be a real design defect.
        """
        profile = getattr(user, "profile", None)
        return Actor(
            user_id=user.pk,
            email=user.email,
            # A profile-less user keeps a usable name but gets role=None,
            # which permissions.require_role refuses outright.
            name=(
                profile.display_name if profile and profile.display_name else user.get_username()
            ),
            role=(profile.role if profile else None),
            is_authenticated=True,
        )
