import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '@/components/api';

export default function SsoCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = params.get('token');
    const role = params.get('role');

    if (!token) {
      setError('No token provided');
      setTimeout(() => navigate('/login?error=sso_failed', { replace: true }), 2000);
      return;
    }

    const verifyAndStoreUser = async () => {
      try {
        console.log('🔄 Sending token to backend for verification...');
        console.log('📝 Token:', token.substring(0, 30) + '...');
        
        // Use fetch for better control
        const response = await fetch(
          `${API_URL}/sso/login?token=${encodeURIComponent(token)}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('📊 Response status:', response.status);
        console.log('📊 Response ok:', response.ok);
        console.log('📊 Response headers:', response.headers.get('content-type'));

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('❌ Response is not JSON:', contentType);
          throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();
        console.log('📦 Response data:', data);

        if (!response.ok) {
          throw new Error(data.message || 'SSO verification failed');
        }

        if (!data.success) {
          throw new Error(data.message || 'SSO verification failed');
        }

        console.log('✅ Backend verification successful!');
        console.log('👤 User data:', data.data?.user);

        // Store user data
     localStorage.setItem('token', token);
localStorage.setItem('userRole', data.data?.user?.role || role || 'seller');
localStorage.setItem('user', JSON.stringify(data.data?.user || {}));
localStorage.setItem('seller', JSON.stringify(data.data?.seller || {}));
        
        // Small delay to show success state
        setLoading(false);
        
        // Navigate based on role
        const userRole = data.data?.user?.role || role || 'seller';
        console.log('🔄 Navigating to:', userRole === 'admin' ? '/templates' : '/search');
        
        setTimeout(() => {
          navigate(userRole === 'admin' ? '/templates' : '/search', { replace: true });
        }, 500);

      } catch (error) {
        console.error('❌ SSO verification failed:', error);
        console.error('Error details:', error.message);
        
        setError(error.message || 'SSO verification failed');
        setTimeout(() => {
          navigate('/login?error=sso_failed', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    verifyAndStoreUser();
  }, [params, navigate]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-5xl text-center mb-4">❌</div>
          <div className="text-red-600 text-xl text-center mb-2">SSO verification failed</div>
          <div className="text-gray-600 text-center mb-4">{error}</div>
          <div className="text-gray-500 text-sm text-center">Redirecting to login...</div>
          <div className="w-full bg-gray-200 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-lg mb-4 text-gray-700">Signing you in...</div>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="mt-4 text-sm text-gray-500">Please wait while we verify your credentials</div>
      </div>
    </div>
  );
}