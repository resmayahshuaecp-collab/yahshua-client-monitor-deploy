class Refusal(Exception):
    """A request the system understood and declined.

    Distinct from a validation error: the request was well-formed, and the
    answer is no. Rendered as a 403 with a machine-readable code by
    core/api_errors.py.
    """

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
