import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-end">
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;