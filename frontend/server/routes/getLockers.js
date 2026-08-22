const db = require('../models/database.js');

module.exports = async (req, res) => {
    const lockers = await db.getLockers();
    console.log('Lockers: %j', lockers);
    res.send(lockers);
};
