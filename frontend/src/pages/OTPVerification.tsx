import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '@/config/config';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

export default function OTPVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const accountNumber = location.state?.accountNumber;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Timer State
  const [timer, setTimer] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Redirect if no account number (direct access prevention)
    if (!accountNumber) {
      navigate('/');
    }
  }, [accountNumber, navigate]);

  // Countdown Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError(t('invalid_otp_length'));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/otp/verify`, 
        { otp, accountNumber },
        { withCredentials: true } // Important for session cookie
      );
      
      // On success, proceed to Fayda Harmonization
      navigate('/harmonization');
    } catch (err: any) {
      setError(err.response?.data?.message || t('verification_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/otp/send`, { accountNumber }, { withCredentials: true });
      setTimer(60); // Reset timer
      setCanResend(false);
    } catch (err: any) {
      setError(t('resend_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
          
          <div className="w-full mb-6 md:mb-8">
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-xs font-bold text-[#004b8d] uppercase tracking-widest">Step 2 of 3</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">OTP Verification</span>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#004b8d] w-2/3 rounded-full transition-all duration-500"></div>
            </div>
          </div>
          
          <div className="w-full flex justify-start mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#004b8d] transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t('back')}
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-[#004b8d] text-[10px] font-black uppercase tracking-[0.3em] mb-2">
              {t('step_2')}
            </h2>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight mb-2">
              {t('enter_otp')}
            </h1>
            <p className="text-gray-500 text-sm">
              {t('otp_sent_message')} <span className="font-semibold text-gray-700">{accountNumber}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className={`relative ${error ? 'animate-shake' : ''}`}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                  setError(null);
                }}
                placeholder="000000"
                className="w-full text-center text-2xl md:text-3xl tracking-[0.2em] md:tracking-[0.5em] font-bold py-4 bg-transparent border-b-2 border-gray-200 focus:border-[#00adef] outline-none text-gray-800 placeholder:text-gray-200 transition-colors"
                autoFocus
              />
            </div>

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary"
            >
              {loading ? <LoadingSpinner className="w-5 h-5 mx-auto" /> : t('verify_code')}
            </button>
          </form>

          <div className="mt-8">
            <button
              onClick={handleResend}
              disabled={!canResend || loading}
              className={`text-sm font-semibold ${canResend ? 'text-[#F7941D] hover:text-[#e68a1b]' : 'text-gray-400 cursor-not-allowed'}`}
            >
              {canResend ? t('resend_code') : `${t('resend_code')} ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
            </button>
          </div>
        </div>
  );
}