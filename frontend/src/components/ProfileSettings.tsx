import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
}

export default function ProfileSettings() {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile (mock for now, replace with API call)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setProfile({
        fullName: user.fullName || 'Abebe Balcha',
        phoneNumber: '0911223344', // Mock phone
        email: 'abebe@example.com',
        address: 'Addis Ababa, Ethiopia'
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Update local storage if needed
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] shadow-[var(--color-shadow-lg)] border border-[var(--color-border)] overflow-hidden">
        <div className="px-6 py-5 sm:px-8 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-card)]">
          <h3 className="text-xl font-bold text-[var(--color-text)]">Profile Settings</h3>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] hover:underline">
            Back to Dashboard
          </button>
        </div>
        
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="fullName" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Full Name</label>
                <input type="text" name="fullName" id="fullName" value={profile.fullName} disabled className="block w-full border border-[var(--color-border)] rounded-[var(--radius)] py-3 px-4 bg-gray-50 text-[var(--color-text-light)] sm:text-sm cursor-not-allowed" />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Phone Number</label>
                <input type="text" name="phoneNumber" id="phoneNumber" value={profile.phoneNumber} disabled className="block w-full border border-[var(--color-border)] rounded-[var(--radius)] py-3 px-4 bg-gray-50 text-[var(--color-text-light)] sm:text-sm cursor-not-allowed" />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email Address</label>
                <input type="email" name="email" id="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="block w-full border border-[var(--color-border)] rounded-[var(--radius)] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all sm:text-sm" />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Address</label>
                <input type="text" name="address" id="address" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="block w-full border border-[var(--color-border)] rounded-[var(--radius)] py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all sm:text-sm" />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-[var(--radius)] text-sm font-medium ${message.type === 'success' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="ml-3 inline-flex items-center justify-center h-12 px-6 border border-transparent shadow-md text-base font-bold rounded-[var(--radius)] text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}