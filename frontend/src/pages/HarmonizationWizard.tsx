import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '@/config/config';
import LoadingSpinner from '../components/LoadingSpinner';
import HarmonizationSkeleton from '../components/HarmonizationSkeleton';
import { useTranslation } from 'react-i18next';
import Alert from '../components/Alert';

interface CbsProfile {
  accountNumber: string;
  fullName: string;
  phoneNumber: string;
  gender?: string;
  nationalId?: string;
}

export default function HarmonizationWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cbsProfile, setCbsProfile] = useState<CbsProfile | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    // Check for errors passed back from the Callback page
    if (location.state?.error) {
      setError(location.state.error);
    }

    const fetchSession = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/auth/session`, {
          withCredentials: true
        });
        
        // If user is already verified (e.g., after returning from Fayda), redirect to success
        if (response.data.user?.nidVerified) {
          navigate('/success');
          return;
        }
        if (response.data.cbsProfile) {
          setCbsProfile(response.data.cbsProfile);
        }
      } catch (err: any) {
        console.error('Session check failed', err);
        // If session is invalid/expired (401 or 403), redirect to home to start over
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/');
          return;
        }
        setError(t('session_load_failed', 'Failed to load account details.'));
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handleConsent = async () => {
    if (!confirmed) {
      setError(t('select_account_required'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Call backend to initiate consent flow and get the Fayda URL
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/consent`,
        {},
        { withCredentials: true }
      );

      if (response.data.success && response.data.consentUrl) {
        // Redirect the browser to Fayda's OIDC authorization page
        window.location.href = response.data.consentUrl;
      } else {
        setError(t('consent_init_failed', 'Failed to initiate consent. Please try again.'));
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t('connection_error', 'Connection error. Please try again.'));
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <HarmonizationSkeleton />;
  }

  // After loading, if there's still no profile, it means the account lookup failed.
  // This is a critical error state that we must handle gracefully.
  if (!cbsProfile) {
    return (
      <div className="auth-card">
        <Alert 
          message={error || t('cbs_profile_load_failed', 'Could not retrieve account details. The session may be invalid or the account number incorrect.')}
        />
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full"
          >
            {t('start_over', 'Start Over')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="auth-card">
          
          <div className="w-full mb-8">
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-xs font-bold text-[#004b8d] uppercase tracking-widest">Step 3 of 3</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Harmonization</span>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#004b8d] w-full rounded-full transition-all duration-500"></div>
            </div>
          </div>
          
          <div className="w-full flex justify-start mb-6">
            <button
              onClick={() => navigate('/otp', { state: { accountNumber: cbsProfile?.accountNumber } })}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#004b8d] transition-colors font-medium p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t('back')}
            </button>
          </div>
          
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
              <img 
                src="/omo-bank-logo.webp" 
                alt="Omo Bank" 
                className="w-10 h-10 object-contain" 
              />
            </div>
            <h2 className="text-[#004b8d] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
              {t('step_3')}
            </h2>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-4">
              {t('confirm_linking')}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('select_account_instruction')}
            </p>
          </div>

          {/* Account Selection List */}
          <div className="space-y-4 mb-8 text-left">
            {cbsProfile && (
              <label className={`relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${confirmed ? 'border-[#004b8d] bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}>
                <div className="flex items-center h-5 mt-1">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="w-5 h-5 text-[#004b8d] border-gray-300 rounded focus:ring-[#004b8d] focus:ring-offset-2"
                  />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-bold text-gray-900">
                    {cbsProfile?.fullName}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5 font-mono tracking-wide">
                    {cbsProfile?.accountNumber}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    <span className="font-semibold text-gray-600">{t('phone_number')}:</span> {cbsProfile?.phoneNumber}
                  </span>
                  {cbsProfile?.gender && (
                    <span className="block text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-600">Gender:</span> {cbsProfile.gender}
                    </span>
                  )}
                </div>
                {confirmed && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#004b8d] rounded-full flex items-center justify-center text-white animate-pop-in">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </label>
            )}
          </div>

          {/* Summary / Info Box */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="text-gray-800 font-semibold text-xs uppercase tracking-wider">{t('summary')}</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>{t('action')}:</span>
                <span className="font-medium">{t('link_fayda_id')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('provider')}:</span>
                <span className="font-medium">{t('national_id_program')}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}

          <button
            onClick={handleConsent}
            disabled={loading || !confirmed}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner className="w-5 h-5" /> : (
              <>
                <img 
                  src="/fayda-logo.png"
                  alt="Fayda" 
                  className="w-6 h-6 object-contain" 
                />
                <span>{t('continue_fayda')}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowCancelModal(true)}
            disabled={loading}
            className="w-full mt-4 py-3 text-sm font-bold tracking-widest text-gray-400 hover:text-[#004b8d] uppercase transition-colors"
          >
            {t('cancel', 'Cancel')}
          </button>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center border border-gray-100 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('cancel_confirmation_title')}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {t('cancel_confirmation_message')}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                {t('go_back')}
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg transition-all"
              >
                {t('confirm_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}