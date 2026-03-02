import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// This component is a placeholder to handle the redirect from the backend.
// The backend's /auth/fayda/callback route will handle the logic and then
// redirect to either /success or /harmonization?error=...
const Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // In a real scenario, you might not even see this page.
    // If the user lands here, it's likely an intermediate step.
    // We can just redirect them home as a fallback.
    navigate('/');
  }, [navigate, location]);

  return <div>Processing...</div>;
};

export default Callback;