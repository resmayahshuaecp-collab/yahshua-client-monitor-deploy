from ninja import Schema


class SearchResult(Schema):
    type: str      # "client", "bug", "rsc", "meeting"
    id: int
    label: str     # what to display
    href: str      # where clicking goes


class SearchOut(Schema):
    results: list[SearchResult]