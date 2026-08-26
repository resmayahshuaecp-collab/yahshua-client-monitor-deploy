from datetime import datetime
from ninja import Schema


class UserOut(Schema):
    id: int
    username: str
    email: str


class MessageOut(Schema):
    id: int
    sender: UserOut
    text: str
    created_at: datetime


class ConversationOut(Schema):
    id: int
    type: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageOut] = []


class MessageIn(Schema):
    text: str
