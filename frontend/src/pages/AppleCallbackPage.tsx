import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { loginWithApple } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const AppleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAppleCallback = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Apple authentication failed');
          navigate('/login');
          return;
        }

        if (token && provider === 'apple') {
          // Store token and redirect
          localStorage.setItem('token', token);
          toast.success('Apple authentication successful!');
          navigate('/');
          return;
        }

        // Handle authorization code flow
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (code && state?.startsWith('apple-signin-')) {
          // Exchange authorization code for tokens
          const appleData = {
            authorizationCode: code,
            state: state
          };

          dispatch(loginWithApple(appleData));
        } else {
          throw new Error('Invalid Apple authentication response');
        }

      } catch (error) {
        console.error('Apple callback error:', error);
        toast.error('Apple authentication failed');
        navigate('/login');
      }
    };

    handleAppleCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Apple Sign-In...
        </h2>
        <p className="text-gray-600">
          Please wait while we process your authentication.
        </p>
      </div>
    </div>
  );
};

export default AppleCallbackPage;