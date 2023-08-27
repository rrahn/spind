
class Position:
    
    _level = -1
    _cell = -1

    def __init__(self, level, cell) -> None:
        self._level = level
        self._cell = cell

    def value(self):
        return self._level + self._cell