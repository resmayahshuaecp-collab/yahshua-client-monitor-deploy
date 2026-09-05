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

class MeetingUpdateIn(Schema):
    title: str | None = None
    description: str | None = None
    scheduled_for: datetime | None = None


class ConcernStatsOut(Schema):
    open_concerns: int
    meetings_this_week: int
    total_bugs: int
    total_rsc: int
    total_meetings: int


class BugReportSummary(Schema):
    total: int
    open: int
    in_progress: int
    resolved: int


class RscReportSummary(Schema):
    total: int
    open: int
    in_progress: int
    completed: int


class ContractStatusCount(Schema):
    status: str
    count: int


class ContractReportSummary(Schema):
    total: int
    active: int
    expiring_soon: int
    expired: int

class NotificationItem(Schema):
    type: str      # "concern", "meeting", "contract"
    label: str
    href: str


class NotificationsOut(Schema):
    count: int
    items: list[NotificationItem]