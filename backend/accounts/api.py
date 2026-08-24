from django.contrib.auth import authenticate, get_user_model
from ninja import Router

from accounts.csrf import enforce_csrf_for_cookie_auth
from accounts.models import Role
from accounts.permissions import require_role
from accounts.providers.local import LocalAuthProvider
from accounts.refusals import Refusal
from accounts.schemas import AccessOut, ActorOut, LoginIn, LoginOut, OkOut, RefreshIn

User = get_user_model()
router = Router(tags=["auth"])


@router.post("/login", response=LoginOut, auth=None)
def login(request, payload: LoginIn):
    # One refusal code for both a bad password and an unknown email. Two
    # different codes would tell an attacker which addresses are real.
    user = authenticate(request, username=payload.email, password=payload.password)
    if user is None or not user.is_active:
        raise Refusal("invalid_credentials", "Email or password is incorrect.")

    provider = LocalAuthProvider()
    access, refresh = provider.issue_tokens(user)
    actor = provider.actor_for(User.objects.select_related("profile").get(pk=user.pk))
    return LoginOut(access=access, refresh=refresh, actor=ActorOut.from_actor(actor))


@router.post("/refresh", response=AccessOut, auth=None)
def refresh(request, payload: RefreshIn):
    from ninja_jwt.exceptions import TokenError
    from ninja_jwt.tokens import RefreshToken

    try:
        token = RefreshToken(payload.refresh)
    except TokenError:
        raise Refusal("invalid_refresh", "Refresh token is not valid.") from None
    return AccessOut(access=str(token.access_token))


@router.get("/me", response=ActorOut, auth=None)
def me(request):
    if not request.actor.is_authenticated:
        raise Refusal("not_authenticated", "This request carries no identity.")
    return ActorOut.from_actor(request.actor)


@router.post("/logout", response=OkOut, auth=None)
def logout(request):
    """Ends the session.

    Exists in Milestone 0 partly because the frontend needs it and partly
    because it is the one state-changing authenticated endpoint, which is
    what gives the CSRF gate a real consumer to be tested against.
    """
    enforce_csrf_for_cookie_auth(request)
    require_role(request.actor, Role.ADMIN, Role.CONSULTANT, Role.ENGINEER)
    return OkOut(ok=True)
