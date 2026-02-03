import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-card">
          <h1 className="text-6xl font-bold text-[#004b8d] mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="btn-primary no-underline"
          >
            Go Home
          </Link>
        </div>
  );
}