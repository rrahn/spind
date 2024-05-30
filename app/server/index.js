const express = require('express');
const db = require('./models/database.js');
const getFloorMaps = require('./routes/getFloorMaps.js');
const getLockerUnits = require('./routes/getLockerUnits.js');
const getLockerUnitsOnFloor = require('./routes/getLockerUnitsOnFloor.js');
const getLockers = require('./routes/getLockers.js');
const getLockersForUnit = require('./routes/getLockersForUnit.js');
// const multer = require('multer');
// const cors = require('cors')

const path = require('path');
const basename = '/Schliessfaecher';

const dev = true;
const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, '..', 'dist');
const htmlIndexFile = path.join(distDir, 'index.html'); // NEW

console.log('Dist dir: ' + distDir);
console.log('Base dir: ' + __dirname);
console.log('Index HTML file: ' + htmlIndexFile);

/** Setup the express server application */

const app = express(); // Create an Express server

// app.use(express.json()); // Enable JSON parsing for request bodies

/** In developer mode enable Hot Module Reloading via webpack-hot-middleware and webpack-dev-middleware */
if (dev) {
    app.use(require('./dev').webpackComp)
    //    .use(require('./dev').apiFallback())
    //    .use(require('./dev').webpackComp)
       .use(require('./dev').webpackHot);
}

app.use(express.static(distDir)); // Serve the static files from the client app
app.use('/assets', express.static(path.join(__dirname, '..', 'assets'))); // Serve the static files from the assets folder
app.use(express.json()); // Enable JSON parsing for request bodies

/** Define middleware functions! */

// const myLogger = function (req, res, next) {
//     console.log('LOGGED: %j', FloorPlanData);
//     next(); // delegate to the next middleware function
// };

// const requestTime = function (req, res, next) {
//     req.requestTime = Date.now();
//     console.log('Request Time:', req.requestTime);
//     next(); // delegate to the next middleware function
// };

/** Register middleware functions in order. */

// Define your API routes here
// ...
// app.get('/Schliessfaecher', (req, res) => {
//   // res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
//   res.send('Hello Schliessfach!');
// });

// app.get('/Schliessfaecher/buchen', (req, res) => {
//   // res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
//   res.send('Load database entries!');
// });

// An api endpoint that returns a short list of items
// app.get('/api/getList', (req, res) => {
//     var list = ['item1', 'item2', 'item3'];
//     console.log('Sent list of items');
//     res.json(list);
// });

app.get('/api/getFloorMaps', getFloorMaps);
app.get('/api/getLockerUnits', getLockerUnits);
app.get('/api/getLockerUnits/floor/:floorId', getLockerUnitsOnFloor);
app.get('/api/getLockers', getLockers);
app.get('/api/getLockers/unit/:unitId', getLockersForUnit);

// app.get('/api/image', (req, res) => {
//     console.log('Sent image from path ' + FloorPlanData[0].image);
//     res.send({
//         image: './assets/hwg-floor-plan.png',
//     });
// });

// app.get('*', (req, res) => {
//     res.sendFile(htmlIndexFile);
// });

// expose the body portion of an incoming request stream on req.body
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // example api endpoint
// app.get(apiBasename + '/user', (req, res) => {
//     res.json({ username: username });
// });

// Serve any static files
// app.use(basename, express.static(path.join(__dirname, 'client/build')));

// Handle React routing, return all requests to React app
// app.get(basename + '/*', function (req, res) {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// Start the server

db.init().then(() => {
  app.listen(port, () => {
    console.log('######################');
    console.log('App listening on port: ' + port);
    console.log('######################');
  })
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

/*
 * Gracefully shutdown the database connection when the process is terminated.
 */
const gracefulShutdown = () => {
  console.log('######################');
  console.log('Server shutting down...');
  console.log('######################');
  db.teardown()
    .catch(() => {})
    .then(() => process.exit(0));
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon