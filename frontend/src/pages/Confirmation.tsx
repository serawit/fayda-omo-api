import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_CONFIG } from '../config/config';

interface IdentityData {
  accountNumber: string;
  accountName: string;
  accountType: string;
  faydaNumber: string;
}

export default function Confirmation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IdentityData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/confirm-identity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Critical: sends the session cookie
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Failed to load details');
        setData(result.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load identity details');
      } finally {
        setLoading(false);
      }
    };

    fetchIdentity();
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/initiate-consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Failed to initiate consent');

      if (result.consentUrl) {
        // Redirect to external Fayda/EthSwitch URL
        window.location.href = result.consentUrl;
      } else {
        throw new Error('No consent URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate consent');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-['Overpass']">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-[#FDC82F] px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Confirm Details</h1>
          <p className="text-[#1a1a1a]/80 mt-2 font-medium">Review your information before proceeding</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium">Account Name</span>
              <span className="font-bold text-gray-900 text-right">{data?.accountName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium">Account Number</span>
              <span className="font-mono font-bold text-gray-900 tracking-wide">{data?.accountNumber}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium">Account Type</span>
              <span className="font-semibold text-gray-900">{data?.accountType}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium">Fayda Number</span>
              <span className="font-mono font-bold text-gray-900 tracking-wide">
                {data?.faydaNumber && data.faydaNumber !== 'Not provided' 
                  ? data.faydaNumber.replace(/(\d{4})(?=\d)/g, '$1 ') 
                  : <span className="text-gray-400 italic">Not provided</span>}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800 leading-relaxed">
                  By clicking <strong>Confirm & Continue</strong>, you will be redirected to the Fayda consent portal to authorize sharing your identity data with Omo Bank.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-4 bg-[#FDC82F] hover:bg-[#eeb51f] text-[#1a1a1a] font-bold text-lg rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner text="Redirecting..." /> : 'Confirm & Continue'}
            </button>
            <button
              onClick={() => navigate(-1)}
              disabled={loading}
              className="w-full py-4 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-all"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}