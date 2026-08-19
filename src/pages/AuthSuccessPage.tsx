import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying authentication...');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check for tokens in URL (cross-origin OAuth flow)
        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');

        if (token) {
          // Store tokens in the format the API service expects
          const authData = {
            accessToken: token,
            refreshToken: refresh || '',
            token: token,
          };
          localStorage.setItem('mediconnect_user', JSON.stringify(authData));
          localStorage.setItem('access_token', token);
          if (refresh) {
            localStorage.setItem('refresh_token', refresh);
          }

          // Clean URL (remove tokens from address bar)
          window.history.replaceState({}, '', '/auth/callback');

          // Verify token by calling /auth/me with Authorization header
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`Auth verification failed: ${response.status}`);
          }

          const data = await response.json();

          setStatus('success');
          setMessage('Authentication successful! Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // Fallback: try cookie-based auth (same-origin)
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Auth verification failed: ${response.status}`);
        }

        const data = await response.json();

        setStatus('success');
        setMessage('Authentication successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (error) {
        setStatus('error');
        setMessage('Authentication verification failed. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    verifyAuth();
  }, [navigate, API_BASE_URL, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <div className="rounded-full h-8 w-8 bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-full h-8 w-8 bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && 'Verifying Authentication'}
            {status === 'success' && 'Welcome Back!'}
            {status === 'error' && 'Verification Failed'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>

          {status === 'error' && (
            <div className="mt-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessPage;