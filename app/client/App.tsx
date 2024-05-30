import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Link, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import LockerOrderForm from './components/LockerOrderForm';
import ErrorPage from './components/ErrorPage';

function Main() {

  // useEffect(() => {
  //   console.log('Main component mounted');

  //   const fetchData = async () => {
  //     const response = await fetch('/api/getFloorplanData');
  //     const data = await response.json();
  //     console.log(data);
  //   }

  //   fetchData();
  //   return () => {
  //     console.log('Main component unmounted');
  //   };
  // }, []);

  return (
    <div>
      <h1>Willkommen zum Schließfachsystem</h1>
      <Link to="buchen">Schließfach buchen</Link>
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([  // This is the router configuration
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
  // basename: "/Schliessfaecher", // This is the base URL of the app.
});

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// Hot Module Replacement from @types/webpack-env plugin
if (module.hot) {
  module.hot.accept();
}
