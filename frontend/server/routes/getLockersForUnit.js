const db = require('../models/database.js');

module.exports = async (req, res) => {
    const lockers = await db.getLockersForUnit(req.params.unitId);
    console.log('Lockers: %j', lockers);
    res.send(lockers.map(locker => {
        return {
            id: locker.CompartmentId,
            kind: locker.LockType === 'Combination' ? 'digit' : 'key',
            state: locker.State,
        };
    }));
}
