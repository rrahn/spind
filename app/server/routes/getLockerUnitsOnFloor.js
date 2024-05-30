const db = require('../models/database.js');

module.exports = async (req, res) => {
    const lockerUnits = await db.getLockerUnitsOnFloor(req.params.floorId);
    const transformedLockerUnits = lockerUnits.map(unit => {
        return {
            id: unit.UnitId,
            kind: 'key',
            area: [unit.TopLeftX, unit.TopLeftY, unit.BottomRightX, unit.BottomRightY]
        };
    });
    console.log('Locker units: %j', transformedLockerUnits);
    res.send(transformedLockerUnits);
}
