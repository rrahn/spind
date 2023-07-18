const db = require('../persistence');
const model = require('../model');
const {v4 : uuid} = require('uuid');

module.exports = async (req, res) => {
    // const locker = {
    //     id: uuid(),
    //     locker_num: req.body.locker_num,
    //     box_num: req.body.box_num,
    //     location: req.body.location,
    //     assignedTo: req.body.status === 'free' ? 0 : req.body.assignedTo,
    //     status: req.body.status,
    //     type: req.body.type,
    // };
    await db.storeLocker(new model.Locker(uuid(), req));
    res.send(locker);
};
