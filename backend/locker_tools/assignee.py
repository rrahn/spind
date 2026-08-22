from pydantic import BaseModel


class Assignee(BaseModel):
    """A person to be assigned a locker.

    ``amount`` is the paid sum (Betrag); it defaults to 0 for entries without a
    recorded payment.
    """

    forename: str
    surname: str
    grade: str
    amount: float = 0
