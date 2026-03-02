// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react'; // Import Suspense
import RootLayout from './components/RootLayout';
import './i18n';
// Import global styles which contain the container logic and icon fixes
import './index.css'; 

// Pages
const Home = lazy(() => import('./pages/Home'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const HarmonizationWizard = lazy(() => import('./pages/HarmonizationWizard'));
const Success = lazy(() => import('./pages/Success'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <BrowserRouter>
      {/* Add Suspense boundary here */}
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/otp" element={<OTPVerification />} />
            <Route path="/harmonization" element={<HarmonizationWizard />} />
            <Route path="/success" element={<Success />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;