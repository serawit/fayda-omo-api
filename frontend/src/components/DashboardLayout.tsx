import React from 'react';
import Navbar from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <main>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;