import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, useSearchParams } from 'react-router-dom';

import LockerOrderForm from './components/LockerOrderForm';
import ErrorPage from './components/ErrorPage';
import FormPage from './pages/FormPage';
import FormPageContact from './pages/FormPageContact';
import FormPageLocker from './pages/FormPageLocker';
import FormPagePayment from './pages/FormPagePayment';
import FormPageSummary from './pages/FormPageSummary';
import ParentPortalPrototype from './pages/ParentPortalPrototype';
import RegisterPage from './pages/parent/RegisterPage';
import VerifyEmailPage from './pages/parent/VerifyEmailPage';
import AccountPage from './pages/parent/AccountPage';

function ParentPreviewEntry() {
  const [params] = useSearchParams();
  return process.env.NODE_ENV !== 'production' && params.get('preview') === 'parents'
    ? <ParentPortalPrototype />
    : <FormPage />;
}

const router = createBrowserRouter([  // This is the router configuration
  {
    path: "/",
    element: <ParentPreviewEntry />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "buchen",
        element: <LockerOrderForm handleSubmit={() => console.log("Got some user data!")} />,
      },
      {
        path: "contact",
        element: <FormPageContact />,
      },
      {
        path: "locker",
        element: <FormPageLocker />,
      },
      {
        path: "summary",
        element: <FormPageSummary />,
      },
      {
        path: "payment",
        element: <FormPagePayment />,
      }
      ],
  },
  { path: "/registrieren", element: <RegisterPage />, errorElement: <ErrorPage /> },
  { path: "/registrieren/bestaetigen", element: <VerifyEmailPage />, errorElement: <ErrorPage /> },
  { path: "/konto", element: <AccountPage />, errorElement: <ErrorPage /> },
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
