import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '@/config/config';
import DashboardLayout from '@/components/DashboardLayout';
import Header from '@/components/Header';

// Define types based on the backend FaydaCustomer model
interface UserProfile {
  _id: string;
  faydaId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  dob?: string;
  address?: string;
  email: string;
  nidVerified: boolean;
  faydaSnapshot?: any; // For photo if available in snapshot
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Call the backend endpoint mapped to getUserProfile
        // Ensure credentials (cookies) are sent with the request
        const response = await axios.get<UserProfile>(`${API_CONFIG.BASE_URL}/user/profile`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch session', err);
        setError('Failed to load profile. Please login again.');
        // Optional: Redirect to login after a delay
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64 text-gray-600">Loading Dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  // Compute display name from parts
  const fullName = [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(' ') || 'Customer';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <Header 
            title="Customer Dashboard" 
            badge={{ text: 'Verified with Fayda', colorClass: 'text-green-800 bg-green-100' }} 
          />

          {user ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-100 shadow-sm mb-4">
                  {/* Assuming photo might be in faydaSnapshot or a placeholder for now */}
                  {user.faydaSnapshot?.photo ? (
                    <img 
                      src={`data:image/jpeg;base64,${user.faydaSnapshot.photo}`} 
                      alt={fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Photo
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-800 text-center">{fullName}</h2>
                <p className="text-sm text-gray-500 mt-1">FIN: {user.faydaId || 'Not Linked'}</p>
              </div>

              {/* Details Section */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoCard label="Phone Number" value={user.phoneNumber || 'N/A'} />
                  <InfoCard label="Gender" value={user.gender || 'N/A'} />
                  <InfoCard label="Date of Birth" value={user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'} />
                  <InfoCard label="Nationality" value="Ethiopian" />
                  <InfoCard label="Email" value={user.email || 'N/A'} />
                  <InfoCard label="Harmonized" value={user.nidVerified ? 'Yes' : 'No'} />
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-900 mb-2">Registered Address</h3>
                  <p className="text-blue-800 text-sm">{user.address || 'No address provided'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No profile data found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Helper component for consistent data display
const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="font-medium text-gray-900 truncate">{value}</p>
  </div>
);

export default Dashboard;