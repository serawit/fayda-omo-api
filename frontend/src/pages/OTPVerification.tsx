import { useState, useEffect, FormEvent, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_CONFIG } from '@/config/config';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OTPVerification() {
  const { t } = useTranslation();
  const [accountNumber, setAccountNumber] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'error' } | null>(null);

  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);

  // On component mount, get the account number from the navigation state
  useEffect(() => {
    if (location.state?.accountNumber) {
      setAccountNumber(location.state.accountNumber);
      // [MOCK] Detect mock mode even if coming from Home page
      if (location.state.accountNumber === '1000000000000000') {
        setIsMockMode(true);
      }
      // Since we navigated here after an OTP was sent,
      // we should start the timer immediately.
      setCountdown(180); // 3 minutes
      setTimerActive(true);
      // Provide an initial message to the user.
      setNotification({ message: t('otp_sent_initial', 'A code has been sent to your registered mobile number.'), type: 'info' });
    } else {
      // If no account number is passed, the user should not be on this page.
      // navigate('/');
      // [MOCK] For testing purposes, allow access with mock account
      setAccountNumber('1000000000000000');
      setIsMockMode(true);
      setCountdown(180);
      setTimerActive(true);
    }
  }, [location.state?.accountNumber, navigate, t]);

  const handleResendOtp = async () => {
    setIsLoading(true);
    setNotification(null);

    try {
      // Use the correct, more secure endpoint
      await axios.post(`${API_CONFIG.BASE_URL}/auth/initiate-login`, { accountNumber }, { withCredentials: true });
      setNotification({ message: t('otp_resent', 'A new code has been sent to the registered mobile number.'), type: 'info' });
      setTimerActive(true);
      setCountdown(180); // Start 3-minute (180 seconds) countdown
    } catch (err: any) {
      setNotification({ message: err.response?.data?.message || t('otp_send_fail', 'Failed to send OTP. Please try again.'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/verify-otp`, { accountNumber, otp }, { withCredentials: true });
      
      if (response.data.success && response.data.redirectUrl) {
        setIsVerified(true);
        setNotification({ message: t('otp_verify_success', 'OTP Verified! Redirecting to Fayda...'), type: 'info' });
        // Redirect to the Fayda consent page provided by the backend
        window.location.href = response.data.redirectUrl;
      }
    } catch (err: any) {
      setNotification({ message: err.response?.data?.message || t('otp_invalid', 'Invalid OTP. Please try again.'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && timerActive && !isVerified) {
      // When timer hits 0 and the code is not yet verified, show an error
      setNotification({ message: t('otp_expired', 'OTP has expired. Please request a new one.'), type: 'error' });
      setTimerActive(false); // Stop the timer from running this logic again
    }
  }, [countdown, timerActive, isVerified, t]);

  // Auto-submit on 6th digit
  useEffect(() => {
    if (otp.length === 6 && formRef.current) {
      formRef.current.requestSubmit();
    }
  }, [otp]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="auth-card">
      {isMockMode && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
          <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
            ⚠️ Mock Mode Active • OTP: 123456
          </span>
        </div>
      )}
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-2 gap-2">
          <span className="text-xs font-bold text-[#004b8d] uppercase tracking-widest">Step 2 of 3</span>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">OTP Verification</span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#004b8d] w-2/3 rounded-full transition-all duration-500"></div>
        </div>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-lg md:text-xl font-bold text-omo-brand tracking-tight mb-2">
          {t('otp_verification_title', 'OTP Verification')}
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          {t('otp_instruction', 'Enter the 6-digit code sent to your registered mobile number.')}
        </p>
      </div>

      <form ref={formRef} onSubmit={handleVerifyOtp} className="space-y-10">
        {notification && <Alert message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

        <div className="space-y-6">
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (val.length <= 6) setOtp(val);
            }}
            required
            placeholder="123456"
            className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-gray-50 border border-gray-200 rounded-lg p-4 outline-none focus:ring-2 focus:ring-[#00adef] focus:border-[#00adef] transition"
          />

          {countdown > 0 && (
            <div className="text-center text-sm text-gray-500">
              {t('time_remaining', 'Time remaining')}: <strong className="text-gray-800 font-mono">{formatTime(countdown)}</strong>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <button type="submit" disabled={isLoading || otp.length !== 6 || countdown === 0} className="btn-primary w-full">
            {isLoading ? <LoadingSpinner className="w-5 h-5" /> : t('verify_code', 'Verify Code')}
          </button>
          {countdown === 0 && (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="mt-4 text-sm font-semibold text-[#004b8d] hover:text-[#00adef] transition-colors disabled:opacity-50"
            >
              {isLoading ? t('sending', 'Sending...') : t('resend_code', 'Resend Code')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}