const db = require('../persistence');

module.exports = async (req, res) => {
    const lockers = await db.getLockers();
    res.send(lockers);
};
