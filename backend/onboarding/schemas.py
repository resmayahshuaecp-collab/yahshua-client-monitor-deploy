from ninja import Schema


class TrainingResourceOut(Schema):
    id: int
    title: str
    resource_type: str
    description: str
    url: str