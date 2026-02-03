import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow sm:rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-blue text-gray-500 space-y-4">
          <p className="text-sm text-gray-400">Last updated: January 2026</p>
          
          <h3 className="text-lg font-semibold text-gray-900">1. Introduction</h3>
          <p>Omo Bank S.C. respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our services.</p>
          
          <h3 className="text-lg font-semibold text-gray-900">2. Data We Collect</h3>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows: Identity Data (Fayda ID), Contact Data, and Financial Data.</p>
          
          <h3 className="text-lg font-semibold text-gray-900">3. Fayda Integration</h3>
          <p>We use the National ID (Fayda) system for identity verification. By using our harmonization services, you consent to the processing of your biometric and demographic data for verification purposes.</p>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
            <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}