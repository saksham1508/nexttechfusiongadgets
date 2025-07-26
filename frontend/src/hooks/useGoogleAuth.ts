import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleAuthInitialized: boolean;
  }
}

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
}

interface UseGoogleAuthReturn {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: GoogleUser | null;
  signIn: () => Promise<GoogleUser | null>;
  signOut: () => Promise<void>;
  error: string | null;
}

const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || clientId === 'your-google-client-id') {
      setError('Google Client ID not configured');
      return;
    }

    const initializeGoogleAuth = async () => {
      try {
        // Load Google Identity Services script
        if (!window.google && !window.googleAuthInitialized) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            window.googleAuthInitialized = true;
            initializeGoogleSignIn();
          };
          
          script.onerror = () => {
            setError('Failed to load Google Identity Services');
          };
          
          document.head.appendChild(script);
        } else if (window.google) {
          initializeGoogleSignIn();
        }
      } catch (err) {
        setError('Failed to initialize Google authentication');
        console.error('Google Auth initialization error:', err);
      }
    };

    const initializeGoogleSignIn = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        setIsLoaded(true);
      } catch (err) {
        setError('Failed to initialize Google Sign-In');
        console.error('Google Sign-In initialization error:', err);
      }
    };

    const handleCredentialResponse = (response: any) => {
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        
        const googleUser: GoogleUser = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          given_name: payload.given_name,
          family_name: payload.family_name,
        };

        setUser(googleUser);
        setIsSignedIn(true);
        setError(null);
      } catch (err) {
        setError('Failed to process Google authentication response');
        console.error('Google Auth response error:', err);
      }
    };

    initializeGoogleAuth();
  }, [clientId]);

  const signIn = async (): Promise<GoogleUser | null> => {
    if (!isLoaded || !window.google) {
      setError('Google authentication not loaded');
      return null;
    }

    try {
      setError(null);
      
      // Prompt for sign-in
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if prompt is not displayed
          window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile',
            callback: (response: any) => {
              if (response.access_token) {
                // Get user info using access token
                fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
                  .then(res => res.json())
                  .then(userInfo => {
                    const googleUser: GoogleUser = {
                      id: userInfo.id,
                      name: userInfo.name,
                      email: userInfo.email,
                      picture: userInfo.picture,
                      given_name: userInfo.given_name,
                      family_name: userInfo.family_name,
                    };
                    setUser(googleUser);
                    setIsSignedIn(true);
                  })
                  .catch(err => {
                    setError('Failed to get user information');
                    console.error('User info error:', err);
                  });
              }
            },
          }).requestAccessToken();
        }
      });

      return user;
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error('Google Sign-In error:', err);
      return null;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (window.google && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      setUser(null);
      setIsSignedIn(false);
      setError(null);
    } catch (err) {
      setError('Failed to sign out');
      console.error('Google Sign-Out error:', err);
    }
  };

  return {
    isLoaded,
    isSignedIn,
    user,
    signIn,
    signOut,
    error,
  };
};

export default useGoogleAuth;