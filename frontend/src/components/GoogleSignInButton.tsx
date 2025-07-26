import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import useGoogleAuth from '../hooks/useGoogleAuth';

interface GoogleSignInButtonProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
  disabled?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  theme = 'outline',
  size = 'large',
  shape = 'rectangular',
  width = 300,
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { isLoaded, user, signIn, error } = useGoogleAuth();

  useEffect(() => {
    if (user) {
      onSuccess(user);
    }
  }, [user, onSuccess]);

  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (isLoaded && buttonRef.current && window.google) {
      try {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme,
          size,
          text,
          shape,
          width: width.toString(),
        });
      } catch (err) {
        console.error('Failed to render Google Sign-In button:', err);
        onError('Failed to render Google Sign-In button');
      }
    }
  }, [isLoaded, theme, size, text, shape, width, onError]);

  const handleManualSignIn = async () => {
    if (disabled) return;
    
    try {
      const result = await signIn();
      if (result) {
        onSuccess(result);
      }
    } catch (err) {
      onError('Failed to sign in with Google');
    }
  };

  if (!isLoaded) {
    return (
      <div 
        className="flex items-center justify-center border border-gray-300 rounded-lg px-4 py-2 bg-white"
        style={{ width: `${width}px`, height: '40px' }}
      >
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">Loading Google Sign-In...</span>
      </div>
    );
  }

  if (error && error.includes('not configured')) {
    return (
      <button
        onClick={handleManualSignIn}
        disabled={disabled}
        className={`flex items-center justify-center border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{ width: `${width}px` }}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {text === 'signin_with' ? 'Sign in with Google' :
           text === 'signup_with' ? 'Sign up with Google' :
           text === 'continue_with' ? 'Continue with Google' :
           'Sign in'}
        </span>
      </button>
    );
  }

  return (
    <div className="google-signin-button">
      <div ref={buttonRef} />
    </div>
  );
};

export default GoogleSignInButton;