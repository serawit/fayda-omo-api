import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';

const RootLayout = () => {
  return (
    <div>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
        <h1>Omo Bank Fayda Harmonization</h1>
      </header>
      <main className="container">
        <Suspense fallback={<div>Loading Page...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default RootLayout;
