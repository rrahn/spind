import express from 'express';
// import db from '../persistence';

const app = express(); // Create an Express server

// Define your API routes here
// ...

// Start the server
const port = process.env.PORT || 3000;
const mockResponse = {
  foo: 'bar',
  bar: 'foo'
};
app.get('/api', (req, res) => {
  res.send(mockResponse);
});
app.get('/', (req, res) => {
 res.status(200).send('Hello World from the server!');
});
app.listen(port, function () {
 console.log('App listening on port: ' + port);
});


// db.init().then(() => {
//   app.listen(5000, () => console.log('Server started on http://localhost:5000'))
// }).catch((err) => {
//   console.error('Failed to start server:', err);
//   process.exit(1);
// });

// /*
//  * Gracefully shutdown the database connection when the process is terminated.
//  */
// const gracefulShutdown = () => {
//   console.log('Server shutting down...');
//   db.teardown()
//     .catch(() => {})
//     .then(() => process.exit(0));
// };

// process.on('SIGINT', gracefulShutdown);
// process.on('SIGTERM', gracefulShutdown);
// process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
