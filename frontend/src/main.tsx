// src/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// i18n must come first
import './i18n';
import './App.css';

// Layouts & Components
import RootLayout from './components/RootLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const OTPVerification = React.lazy(() => import('./pages/OTPVerification'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const HarmonizationWizard = React.lazy(() => import('./pages/HarmonizationWizard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Success = React.lazy(() => import('./pages/Success')); // add this if you have it
const ErrorPage = React.lazy(() => import('./pages/ErrorPage'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const HelpAndFAQs = React.lazy(() => import('./pages/HelpAndFAQs'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
      <Suspense fallback={<div>Loading...</div>}>
        <NotFound />
      </Suspense>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'otp', element: <OTPVerification /> },
      
      // → Harmonization is PUBLIC after OTP (no token needed)
      {
        path: 'harmonization',
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading wizard...</div>}>
            <HarmonizationWizard />
          </Suspense>
        ),
      },

      // Optional: Success page (final step)
      {
        path: 'success',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Success />
          </Suspense>
        ),
      },

      // Error Page for handling redirects from backend
      {
        path: 'error',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ErrorPage />
          </Suspense>
        ),
      },

      {
        path: 'privacy',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PrivacyPolicy />
          </Suspense>
        ),
      },

      {
        path: 'help',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <HelpAndFAQs />
          </Suspense>
        ),
      },

      { path: '*', element: <NotFound /> },
    ],
  },

  // Protected area – only logged-in users
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Dashboard /> },
      // Do NOT put harmonization here
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);