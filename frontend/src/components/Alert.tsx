import React from 'react';

interface AlertProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onClose?: () => void;
}

const alertStyles = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    iconColor: 'text-red-500',
    textColor: 'text-red-700',
  },
  // Add warning and info styles if needed
};

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

export default function Alert({ message, type = 'error', onClose }: AlertProps) {
  const styles = alertStyles[type];

  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border} animate-shake`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.iconColor}`}>
          <ErrorIcon />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${styles.textColor}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button type="button" onClick={onClose} className={`p-1.5 rounded-md ${styles.textColor} hover:bg-red-100`}>
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}