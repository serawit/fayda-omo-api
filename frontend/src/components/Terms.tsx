import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow sm:rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="prose prose-blue text-gray-500 space-y-4">
          <p className="text-sm text-gray-400">Last updated: January 2026</p>
          
          <h3 className="text-lg font-semibold text-gray-900">1. Agreement to Terms</h3>
          <p>By accessing our services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          
          <h3 className="text-lg font-semibold text-gray-900">2. Account Security</h3>
          <p>You are responsible for safeguarding the password and account information that you use to access the service.</p>
          
          <h3 className="text-lg font-semibold text-gray-900">3. Fayda Harmonization</h3>
          <p>Users are required to provide accurate Fayda ID information. Providing false identification information is a violation of these terms and applicable laws.</p>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
            <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}