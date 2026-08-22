const db = require('../models/database.js');

module.exports = async (req, res) => {
    const floorMaps = await db.getFloorMaps();
    console.log('Floor maps: %j', floorMaps);
    res.send(floorMaps.map(floorMap => {
        return {
            level: floorMap.level,
            image: './assets/' + floorMap.image,
            title: floorMap.title
        };
    }));
};
