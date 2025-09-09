import React, { useEffect, useState } from 'react';

// Minimal typings for the Facebook SDK on the window object
declare global {
  interface Window {
    FB: any;
    fbAsyncInit?: () => void;
  }
}

export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  accessToken: string;
  userID: string;
}

interface Props {
  text?: string; // Button text
  className?: string; // Optional custom classes
  onSuccess: (user: FacebookUser) => void;
  onError?: (message: string) => void;
}

// Utility: load Facebook SDK script
const loadFacebookSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.FB) return resolve();

    // Avoid duplicating the script
    if (document.getElementById('facebook-jssdk')) return resolve();

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));

    // fbAsyncInit is called by the SDK when it is loaded
    window.fbAsyncInit = () => resolve();

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  });
};

const FacebookLoginButton: React.FC<Props> = ({ text = 'Continue with Facebook', className, onSuccess, onError }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appId = process.env.REACT_APP_FACEBOOK_APP_ID;

  useEffect(() => {
    const init = async () => {
      try {
        if (!appId) {
          setError('Facebook App ID not configured');
          return;
        }

        await loadFacebookSDK();

        if (!window.FB) {
          throw new Error('Facebook SDK not available');
        }

        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: false,
          version: 'v19.0', // Use the current Graph API version you prefer
        });

        setIsReady(true);
      } catch (e: any) {
        const msg = e?.message || 'Failed to initialize Facebook Login';
        setError(msg);
        onError?.(msg);
      }
    };

    init();
  }, [appId, onError]);

  const handleLogin = () => {
    if (!window.FB) {
      const msg = 'Facebook SDK not loaded';
      setError(msg);
      onError?.(msg);
      return;
    }

    window.FB.login(
      (response: any) => {
        if (response?.authResponse) {
          const { accessToken, userID } = response.authResponse;

          // Fetch basic profile
          window.FB.api(
            '/me',
            { fields: 'id,name,email,picture' },
            (user: any) => {
              const fbUser: FacebookUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                picture: user?.picture?.data?.url,
                accessToken,
                userID,
              };
              onSuccess(fbUser);
              setError(null);
            }
          );
        } else {
          const msg = 'User cancelled login or did not authorize.';
          setError(msg);
          onError?.(msg);
        }
      },
      { scope: 'public_profile' }
    );
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={!isReady || !!error}
      className={
        className ||
        'px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
      }
      aria-disabled={!isReady || !!error}
    >
      {text}
    </button>
  );
};

export default FacebookLoginButton;