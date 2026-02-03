// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy } from 'react';
import RootLayout from './components/RootLayout';
import './i18n';
// Import global styles which contain the container logic and icon fixes
import './index.css'; 

// Pages
const Home = lazy(() => import('./pages/Home'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const HarmonizationWizard = lazy(() => import('./pages/HarmonizationWizard'));
const Success = lazy(() => import('./pages/Success'));
const Callback = lazy(() => import('./pages/Callback'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/otp" element={<OTPVerification />} />
          <Route path="/harmonization" element={<HarmonizationWizard />} />
          <Route path="/success" element={<Success />} />
          <Route path="/callback" element={<Callback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}