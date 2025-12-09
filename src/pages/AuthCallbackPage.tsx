import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Store user and token in localStorage
        localStorage.setItem('mediconnect_user', JSON.stringify({ ...user, token }));
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
          // Reload to update auth context
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        navigate('/login?error=auth_failed', { replace: true });
      }
    } else {
      navigate('/login?error=auth_failed', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <Activity className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Completing Sign In...</h2>
        <p className="text-slate-400">Please wait while we redirect you.</p>
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
