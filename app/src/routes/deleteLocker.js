const db = require('../persistence');

module.exports = async (req, res) => {
    await db.removeLocker(req.params.id);
    res.sendStatus(200);
};
