from datetime import datetime

from ninja import Schema


class BugOut(Schema):
    id: int
    title: str
    description: str
    status: str
    priority: str
    created_at: datetime


class BugIn(Schema):
    title: str
    description: str = ""
    priority: str = "MEDIUM"


class BugUpdateIn(Schema):
    status: str | None = None
    priority: str | None = None