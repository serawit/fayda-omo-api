// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback UI
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to your error tracking service (e.g., Sentry, LogRocket)
    console.error('Uncaught error in component:', error, errorInfo);

    if (import.meta.env.PROD) {
      // Example with Sentry (install @sentry/react if needed)
      // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    }
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI (you can make this nicer)
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry — an unexpected error occurred. Our team has been notified.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={this.resetError}
              className="h-14 px-8 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;