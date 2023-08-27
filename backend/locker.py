
class Locker:
    _id = 0
    _box = 0

    def __init__(self, id, box):
        self._id = id
        self._box = box

    def id(self):
        return self._id

    def box(self):
        return self._box

    def __eq__(self, other):
        if not isinstance(other, Locker):
            # don't attempt to compare against unrelated types
            return NotImplemented

        return self.id() == other.id() and self.box() == other.box()

    def __lt__(self, other):
        return self.id() < other.id() or (self.id() == other.id() and self.box() < other.box())

    def __hash__(self):
        return self.id()*100+self.box()


