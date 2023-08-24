import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from './components/main.js';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ErrorPage from './components/errorPage.js';
import OrderView from './components/orders/orderView.js';
import LockerView from './components/lockers/lockerView.js';

const router = createBrowserRouter([
    {
      path: "/",
      element: <Main />,
      errorElement: <ErrorPage />,
      children: [
            {   
                path: "orders",
                element: <OrderView />,
            },
            {   
                path: "lockers",
                element: <LockerView />,
            },
        ],
    },
]);

// const express = require('express');
// const app = express();
// const db = require('./persistence');
// // const getItems = require('./routes/getItems');
// // const addItem = require('./routes/addItem');
// // const updateItem = require('./routes/updateItem');
// // const deleteItem = require('./routes/deleteItem');
// const getLockers = require('./routes/getLockers');
// const addLocker = require('./routes/addLocker');
// const updateLocker = require('./routes/updateLocker');
// const deleteLocker = require('./routes/deleteLocker');

// app.use(express.json());
// app.use(express.static(__dirname + '/static'));

// // app.get('/items', getItems);
// app.get('/lockers', getLockers);

// // app.post('/items', addItem);
// app.post('/lockers', addLocker);

// // app.put('/items/:id', updateItem);
// app.put('/lockers/:id', updateLocker);

// // app.delete('/items/:id', deleteItem);
// app.delete('/lockers/:id', deleteLocker);

// db.init().then(() => {
//     app.listen(3000, () => console.log('Listening on port 3000'));
// }).catch((err) => {
//     console.error(err);
//     process.exit(1);
// });

// const gracefulShutdown = () => {
//     db.teardown()
//         .catch(() => {})
//         .then(() => process.exit());
// };

// process.on('SIGINT', gracefulShutdown);
// process.on('SIGTERM', gracefulShutdown);
// process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<RouterProvider router={router} />);