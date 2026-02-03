import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get('reason');

  let title = 'Something went wrong';
  let message = 'We encountered an unexpected error. Please try again later.';
  let showRetry = true;

  // Map backend error codes to friendly messages
  switch (reason) {
    case 'max_accounts_limit':
      title = 'Limit Reached';
      message = 'You have reached the maximum number of accounts (5) that can be linked to this Fayda ID.';
      showRetry = false; // Retry won't fix this immediately
      break;
    case 'auth_failed':
      title = 'Authentication Failed';
      message = 'We could not verify your identity with Fayda. Please ensure your details match.';
      break;
    case 'consent_denied':
      title = 'Consent Denied';
      message = 'You denied the request to share your information. We cannot proceed without your consent.';
      break;
    case 'session_invalid':
      title = 'Session Expired';
      message = 'Your session has expired due to inactivity. Please start the process again.';
      break;
    case 'server_error':
      title = 'System Error';
      message = 'Our systems are currently experiencing issues. Please try again in a few minutes.';
      break;
    default:
      if (reason) {
        message = `Error code: ${reason}. Please contact support if this persists.`;
      }
      break;
  }

  return (
    <div className="auth-card">
          
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-3">
              {title}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          <div className="space-y-3">
            {showRetry && (
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Try Again
              </button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <a href="tel:9555" className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 12.284 3 5z"/></svg>
                Call Support
              </a>
              <a href="https://www.omobank.com.et/branches" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Find Branch
              </a>
            </div>
          </div>

        </div>
  );
}