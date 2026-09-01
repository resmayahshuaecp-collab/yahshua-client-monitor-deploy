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


class RscOut(Schema):
    id: int
    title: str
    description: str
    status: str
    priority: str
    created_at: datetime


class RscIn(Schema):
    title: str
    description: str = ""
    priority: str = "MEDIUM"


class RscUpdateIn(Schema):
    status: str | None = None
    priority: str | None = None


class MeetingOut(Schema):
    id: int
    title: str
    description: str
    scheduled_for: datetime
    created_at: datetime


class MeetingIn(Schema):
    title: str
    description: str = ""
    scheduled_for: datetime


class ConcernStatsOut(Schema):
    open_concerns: int
    meetings_this_week: int