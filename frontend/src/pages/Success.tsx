import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_CONFIG } from '@/config/config';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Success() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verify the user has a valid session before showing the success page
        await axios.get(`${API_CONFIG.BASE_URL}/auth/session`, {
          withCredentials: true
        });
        setIsVerifying(false);
      } catch (error) {
        // If unauthorized or session expired, redirect to home
        navigate('/', { replace: true });
      }
    };
    checkSession();

    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  // Auto-redirect to dashboard after 30 seconds
  useEffect(() => {
    if (!isVerifying) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isVerifying, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8 text-green-600" />
      </div>
    );
  }

  return (
    <>
      <Confetti width={dimensions.width} height={dimensions.height} recycle={false} numberOfPieces={500} gravity={0.2} />
      <div className="auth-card">
          
          <div className="mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-green-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
              {t('success', 'Success')}
            </h2>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-4">
              {t('identity_verified', 'Identity Verified')}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('success_message', 'Your Omo Bank account has been successfully linked with your Fayda Digital ID.')}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4 md:p-6 mb-8 border border-green-100 text-left">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-green-800 font-bold text-sm">{t('harmonization_complete', 'Harmonization Complete')}</span>
            </div>
            <p className="text-green-700/80 text-xs">
              {t('profile_updated_message', 'Your profile information has been updated and verified against the National ID system. You can now access all verified services.')}
            </p>
          </div>

          <Link
            to="/dashboard"
            className="btn-primary no-underline"
          >
            <span>{t('go_to_dashboard', 'Go to Dashboard')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
    </>
  );
}