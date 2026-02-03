import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const OTPVerification = lazy(() => import('./pages/Otp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HarmonizationWizard = lazy(() => import('./pages/HarmonizationWizard'));

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTPVerification />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/harmonization" element={<HarmonizationWizard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </div>
  );
}