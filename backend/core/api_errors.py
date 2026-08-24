from ninja import NinjaAPI
from ninja.responses import Response

from accounts.refusals import Refusal

# A refusal is not a server error and not a validation error. It gets its
# own status and a machine-readable code so the frontend can tell "your
# session expired" from "your role cannot do this".
_STATUS_BY_CODE = {
    "not_authenticated": 401,
}


def register_refusal_handler(api: NinjaAPI) -> None:
    @api.exception_handler(Refusal)
    def _handle(request, exc: Refusal):
        status = _STATUS_BY_CODE.get(exc.code, 403)
        return Response({"code": exc.code, "message": exc.message}, status=status)
