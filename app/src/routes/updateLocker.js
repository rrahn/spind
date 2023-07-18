const db = require('../persistence');

module.exports = async (req, res) => {
    await db.updateLocker(req.params.id, {
        locker_num: req.body.locker_num,
        box_num: req.body.box_num,
        location: req.body.location,
        assignedTo: req.body.status === 'free' ? 0 : req.body.assignedTo,
        status: req.body.status,
        type: req.body.type,
    });
    const item = await db.getLocker(req.params.id);
    res.send(item);
};
