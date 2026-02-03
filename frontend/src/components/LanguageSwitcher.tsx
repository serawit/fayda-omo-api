import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
      aria-label="Switch Language"
    >
      <span className={i18n.language === 'en' ? 'font-bold text-[#004b8d]' : 'text-gray-500'}>EN</span>
      <span className="text-gray-300">|</span>
      <span className={i18n.language === 'am' ? 'font-bold text-[#004b8d] font-ethiopic' : 'text-gray-500 font-ethiopic'}>አማ</span>
    </button>
  );
};

export default LanguageSwitcher;