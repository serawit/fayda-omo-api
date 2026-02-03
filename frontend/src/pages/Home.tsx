import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { API_CONFIG } from '@/config/config';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (accountNumber.trim().length < 8) {
      setError('Invalid account format. Please enter at least 8 digits.');
      return;
    }
    if (!termsAccepted) {
      setError(t('accept_terms_error'));
      return;
    }
    setLoading(true);
    
    try {
      // Call backend to generate and send OTP
      await axios.post(`${API_CONFIG.BASE_URL}/otp/send`, { accountNumber }, { withCredentials: true });
      
      setLoading(false);
      navigate('/otp', { state: { accountNumber } });
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <div className="auth-card">
        
        <div className="w-full mb-8">
          <div className="flex justify-between items-center mb-2 gap-2">
            <span className="text-xs font-bold text-[#004b8d] uppercase tracking-widest">Step 1 of 3 </span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Account Verification</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#004b8d] w-1/3 rounded-full transition-all duration-500"></div>
          </div>
        </div>
        
        {/* Logo Section */}
        <div className="mb-10">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-6">
            <img 
              src="/omo-bank-logo.webp" 
              alt="Omo Bank S.C." 
              className="w-full h-full object-contain" 
            />
          </div>
          <p className="text-gray-500 text-sm mb-4 font-medium">
            <Trans i18nKey="link_fayda_instruction">
              Link your <span className="font-bold text-[#004b8d]">FAYDA ID</span> with your bank account
            </Trans>
          </p>
          <h2 className="text-[#004b8d] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
            {t('bank_name')}
          </h2>
          <h1 className="text-lg md:text-xl font-bold text-omo-brand tracking-tight">
            {t('app_title')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className={`relative border-b-2 border-gray-100 focus-within:border-[#00adef] transition-all ${error ? 'animate-shake' : ''}`}>
            <div className="absolute left-0 bottom-3 text-[#00adef] icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0H5m14 0h-5" />
              </svg>
            </div>
            <input
              type="text"
              inputMode="numeric"
              required
              value={accountNumber}
              onChange={(e) => {setAccountNumber(e.target.value); setError(null);}}
              placeholder={t('account_number')}
              className="w-full pl-10 pr-10 py-3 bg-transparent text-lg font-medium outline-none placeholder:text-gray-300 text-gray-700"
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight">{error}</p>}

          <div className="flex items-center justify-start gap-3 text-left px-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked) setError(null);
              }}
              className="w-4 h-4 text-[#004b8d] border-gray-300 rounded focus:ring-[#004b8d] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer select-none">
              {t('terms_conditions')}
            </label>
          </div>

          <div className="flex flex-col items-center">
            <button
              type="submit"
              disabled={loading || accountNumber.length < 8 || !termsAccepted}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner className="w-5 h-5" /> : (
                <>
                  <span>{t('get_otp')}</span>
                  <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform flex items-center justify-center">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              )}
            </button>
          </div>
        </form>

        {/* PWA Install Button */}
        {installPrompt && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#004b8d] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('install_app', 'Install App')}
            </button>
          </div>
        )}

        <div className="mt-8 md:mt-14 pt-8 border-t border-gray-50 flex justify-center">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 rounded-xl border border-gray-900">
            <div className="relative text-white flex items-center justify-center">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
              {t('bank_grade_security')}
            </span>
          </div>
        </div>
      </div>
  );
}
