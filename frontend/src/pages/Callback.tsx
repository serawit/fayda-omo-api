import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '@/config/config';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const processedRef = useRef(false); // Prevent double-execution in React StrictMode

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // 1. Handle errors returned by Fayda (e.g., User denied consent)
    if (error) {
      navigate('/harmonization', { 
        state: { error: t('fayda_auth_failed', 'Authorization failed or cancelled.') } 
      });
      return;
    }

    // 2. If no code is present, redirect to home
    if (!code) {
      navigate('/');
      return;
    }

    // 3. Send code to Backend to perform the Data Override/Harmonization
    const harmonizeData = async () => {
      try {
        await axios.post(
          `${API_CONFIG.BASE_URL}/auth/callback`, 
          { code },
          { withCredentials: true }
        );
        
        // 4. On success, the backend has updated the DB. Redirect to Success page.
        navigate('/success');
      } catch (err: any) {
        console.error('Harmonization failed', err);

        navigate('/harmonization', { 
          state: { error: err.response?.data?.message || t('harmonization_failed', 'Failed to synchronize account information.') } 
        });
      }
    };

    harmonizeData();
  }, [searchParams, navigate, t]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full flex flex-col items-center">
        <LoadingSpinner className="w-12 h-12 text-[#004b8d] mb-6" />
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {t('processing_data', 'Harmonizing Data...')}
        </h2>
        
        <p className="text-gray-500 text-sm leading-relaxed">
          {t('callback_message', 'Please wait while we securely retrieve your Fayda ID information and update your Omo Bank profile.')}
        </p>
      </div>
    </div>
  );
}