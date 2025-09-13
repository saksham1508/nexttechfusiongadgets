import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { AppleIDConfig, AppleIDAuthResponse } from '../types/apple-id';

interface AppleSignInButtonProps {
  onSuccess: (appleData: any) => void;
  onError: (error: string) => void;
  text?: 'signin' | 'signup' | 'continue';
  theme?: 'black' | 'white' | 'white-outline';
  size?: 'small' | 'medium' | 'large';
  width?: number;
  disabled?: boolean;
}



const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'signin',
  theme = 'black',
  size = 'medium',
  width = 300,
  disabled = false
}) => {
  const [isAppleSDKLoaded, setIsAppleSDKLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Apple ID SDK is already loaded
    if (window.AppleID) {
      initializeAppleID();
      return;
    }

    // Load Apple ID SDK
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      initializeAppleID();
    };
    script.onerror = () => {
      console.error('Failed to load Apple ID SDK');
      setIsAppleSDKLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src*="appleid.auth.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const initializeAppleID = () => {
    try {
      const clientId = process.env.REACT_APP_APPLE_CLIENT_ID;
      const redirectURI = process.env.REACT_APP_APPLE_REDIRECT_URI || `${window.location.origin}/auth/apple/callback`;

      // Check if Apple configuration is available
      if (process.env.NODE_ENV !== 'production' && (!clientId || clientId === 'your-apple-client-id' || clientId.includes('mock'))) {
        console.log('🔄 Apple ID SDK loaded but using mock configuration (dev only)');
        setIsAppleSDKLoaded(true);
        return;
      }

      // Ensure required config is present in non-dev builds
      if (!clientId) {
        throw new Error('Apple Sign-In client ID is not configured');
      }

      // After validation, assert non-null for TypeScript
      const requiredClientId = clientId as string;
      const requiredRedirectURI = redirectURI as string;

      window.AppleID.auth.init({
        clientId: requiredClientId,
        scope: 'name email',
        redirectURI: requiredRedirectURI,
        state: 'apple-signin-' + Date.now(),
        usePopup: true
      });

      setIsAppleSDKLoaded(true);
      console.log('✅ Apple ID SDK initialized');
    } catch (error) {
      console.error('Failed to initialize Apple ID:', error);
      setIsAppleSDKLoaded(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      const clientId = process.env.REACT_APP_APPLE_CLIENT_ID;

      // Check if Apple configuration is properly set up
      if (process.env.NODE_ENV !== 'production' && (!clientId || clientId === 'your-apple-client-id' || clientId.includes('mock'))) {
        console.log('🔄 Using mock Apple authentication (dev only)');
        
        // Create mock Apple response
        const mockAppleData = {
          identityToken: 'mock_apple_identity_token_' + Date.now(),
          authorizationCode: 'mock_apple_auth_code_' + Date.now(),
          user: {
            email: 'user@apple.demo',
            name: {
              firstName: 'Apple',
              lastName: 'User'
            }
          }
        };

        toast.success('Apple authentication successful (Demo Mode)');
        onSuccess(mockAppleData);
        return;
      }

      // Real Apple Sign-In
      if (!window.AppleID || !isAppleSDKLoaded) {
        throw new Error('Apple ID SDK not loaded');
      }

      const response = await window.AppleID.auth.signIn();
      
      if (response.authorization) {
        const appleData = {
          identityToken: response.authorization.id_token,
          authorizationCode: response.authorization.code,
          user: response.user || null
        };

        onSuccess(appleData);
      } else {
        throw new Error('Apple authentication failed');
      }

    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      
      if (error.error === 'popup_closed_by_user') {
        // User closed the popup, don't show error
        return;
      }

      const errorMessage = error.message || 'Apple authentication failed';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Signing in...';
    
    const clientId = process.env.REACT_APP_APPLE_CLIENT_ID;
    const isDemoMode = !clientId || clientId === 'your-apple-client-id' || clientId.includes('mock');
    
    const baseText = {
      signin: 'Sign in with Apple',
      signup: 'Sign up with Apple',
      continue: 'Continue with Apple'
    }[text];

    return isDemoMode ? `${baseText} (Demo)` : baseText;
  };

  const getButtonStyles = () => {
    const baseStyles = 'flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeStyles = {
      small: 'text-sm py-2 px-3',
      medium: 'text-base py-3 px-4',
      large: 'text-lg py-4 px-6'
    }[size];

    const themeStyles = {
      black: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-500',
      white: 'bg-white text-black border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      'white-outline': 'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white focus:ring-black'
    }[theme];

    return `${baseStyles} ${sizeStyles} ${themeStyles}`;
  };

  return (
    <button
      onClick={handleAppleSignIn}
      disabled={disabled || isLoading}
      className={getButtonStyles()}
      style={{ width: width ? `${width}px` : 'auto' }}
      type="button"
    >
      {/* Apple Logo SVG */}
      <svg 
        className="w-5 h-5 mr-3" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      {getButtonText()}
    </button>
  );
};

export default AppleSignInButton;