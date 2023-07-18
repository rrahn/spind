import {Box} from './box';
import {BoxStatus} from './BoxStatus';

module.exports = class Locker {
    id = null;
    name = 0;
    boxList = [];
    type = null;

    constructor(id, request) {
        this.id = id;
        this.boxList = createBoxes(request.body.boxCount);
        this.type = request.body.type;
    }

    constructor(dbRows) {
        this.id = dbRows.id;
        this.name = dbRows.locker_num;
        this.boxList = createBoxes(request.body.boxCount);
        this.type = request.body.type;
    }

    #createBoxes(count) {
        return Array.from({length: count}, (value, index) => index + 1).map(boxNumber => {
            return new Box(uuid(), boxNumber, new BoxStatus());
        });
    }
}
