from ninja import Schema

from accounts.actor import Actor


class LoginIn(Schema):
    email: str
    password: str


class RefreshIn(Schema):
    refresh: str


class ActorOut(Schema):
    user_id: int | None
    email: str
    name: str
    role: str | None

    @classmethod
    def from_actor(cls, actor: Actor) -> "ActorOut":
        return cls(user_id=actor.user_id, email=actor.email, name=actor.name, role=actor.role)


class LoginOut(Schema):
    access: str
    refresh: str
    actor: ActorOut


class AccessOut(Schema):
    access: str


class OkOut(Schema):
    ok: bool
