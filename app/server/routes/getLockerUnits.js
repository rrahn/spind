const db = require('../models/database.js');

module.exports = async (req, res) => {
    const lockerUnits = await db.getLockerUnits();
    const transformedLockerUnits = lockerUnits.map(unit => {
        return {
            unitId: unit.UnitId,
            floorId: unit.FloorId,
            area: [unit.TopLeftX, unit.TopLeftY, unit.BottomRightX, unit.BottomRightY]
        };
    });
    console.log('Locker units: %j', transformedLockerUnits);
    res.send(transformedLockerUnits);
}
