import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Link, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import LockerOrderForm from './components/LockerOrderForm';
import ErrorPage from './components/ErrorPage';
import { basename } from 'path';

function Main() {
  return (
    <div>
      <h1>Willkommen zum Schließfachsystem</h1>
      <Link to="buchen">Schließfach buchen</Link>
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "buchen",
        element: <LockerOrderForm handleSubmit={() => console.log("Got some user data!")} />,
      },
      ],
  },
], {
  basename: "/Schliessfaecher", // This is the base URL of the app.
});

// function App() {
//   return (
//     <div>
//       <LockerOrderForm handleSubmit={() => console.log("Got some user data!")} />
//     </div>
//   );
// };

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
