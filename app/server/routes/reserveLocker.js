const db = require('../models/database.js');

module.exports = (io) => {
    return async (req, res) => {

        console.log('Request: %j', req.body);
        const newLocker = req.body.postData.newLocker;
        const oldLocker = req.body.postData.oldLocker;
        console.log('Reserving new locker: %j and freeing old locker %j', newLocker, oldLocker);
        try {
            await db.reserveLocker(newLocker, oldLocker);
            // Notify all connected clients that a locker has been reserved
            io.emit('lockerUpdate', newLocker);
            res.sendStatus(200);
        } catch (error) {
            console.error('Failed to reserve locker:', error);
            res.status(400).json({ error: error.message });
        }
    }
};
