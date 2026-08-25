from datetime import date

from ninja import Schema


class ClientOut(Schema):
    id: int
    name: str
    segment: str
    contract_start: date
    contract_end: date
    status: str