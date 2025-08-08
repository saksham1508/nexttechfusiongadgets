import React, { useState } from 'react';
import { Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { syncFromLocalStorage } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import GoogleSignInButton from './GoogleSignInButton';
import AppleSignInButton from './AppleSignInButton';

interface SocialAuthProps {
  onGoogleAuth: (googleUser: any) => void;
  onFacebookAuth: (token: string) => void;
  onAppleAuth: (appleData: any) => void;
  onPhoneAuth: (phone: string, otp: string) => void;
  onEmailAuth: (email: string, password: string) => void;
  isLoading: boolean;
}

const SocialAuth: React.FC<SocialAuthProps> = ({
  onGoogleAuth,
  onFacebookAuth,
  onAppleAuth,
  onPhoneAuth,
  onEmailAuth,
  isLoading
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'social'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
    countryCode: '+1',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };



  const handleFacebookLogin = async () => {
    try {
      const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
      
      // Check if Facebook App ID is properly configured
      if (!facebookAppId || facebookAppId === 'your-dev-facebook-app-id' || facebookAppId.includes('mock')) {
        console.log('🔄 Using mock Facebook authentication');
        
        // Create mock Facebook access token and call the handler
        const mockAccessToken = 'mock_facebook_token_' + Date.now();
        toast.success('Facebook authentication successful (Demo Mode)');
        onFacebookAuth(mockAccessToken);
        return;
      }

      // Using Facebook SDK (real authentication)
      if (typeof window !== 'undefined' && window.FB) {
        window.FB.login((response: any) => {
          if (response.authResponse) {
            onFacebookAuth(response.authResponse.accessToken);
          } else {
            toast.error('Facebook authentication failed');
          }
        }, { scope: 'email,public_profile' });
      } else {
        // Fallback: Open Facebook OAuth in popup
        const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/facebook/callback')}&response_type=code&scope=email`;
        
        const popup = window.open(
          facebookAuthUrl,
          'facebook-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
          }
        }, 1000);
      }
    } catch (error) {
      toast.error('Facebook authentication failed');
      console.error('Facebook auth error:', error);
    }
  };

  const handlePhoneSubmit = async () => {
    if (phoneStep === 'phone') {
      if (!formData.phone) {
        toast.error('Please enter your phone number');
        return;
      }
      
      // Validate phone number format
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
      
      try {
        // Show loading state
        const loadingToast = toast.loading('Sending OTP...');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.dismiss(loadingToast);
        toast.success('OTP sent to your phone number');
        setPhoneStep('otp');
      } catch (error) {
        toast.error('Failed to send OTP. Please try again.');
      }
    } else {
      if (!formData.otp) {
        toast.error('Please enter the OTP');
        return;
      }
      
      if (formData.otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }
      
      onPhoneAuth(formData.countryCode + formData.phone, formData.otp);
    }
  };

  const handleEmailSubmit = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // For demo purposes, allow test@example.com with testpassword
    if (formData.email === 'test@example.com' && formData.password === 'testpassword') {
      try {
        // Use the backend mock auth endpoint to get a proper JWT token
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store user data with proper JWT token
          const userData = {
            user: data.user,
            token: data.token
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', data.token);
          
          // Update Redux auth state immediately
          dispatch(syncFromLocalStorage());
          
          toast.success('Demo login successful!');
          
          // Small delay to ensure state is updated, then reload
          setTimeout(() => {
            window.location.reload();
          }, 500);
          
          return;
        } else {
          toast.error(data.error?.message || 'Login failed');
          return;
        }
      } catch (error) {
        console.error('Demo login error:', error);
        toast.error('Demo login failed. Please try again.');
        return;
      }
    }
    
    onEmailAuth(formData.email, formData.password);
  };

  const countryCodes = [
    { code: '+1', country: 'US' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'IN' },
    { code: '+86', country: 'CN' },
    { code: '+81', country: 'JP' },
    { code: '+49', country: 'DE' },
    { code: '+33', country: 'FR' },
    { code: '+39', country: 'IT' },
    { code: '+34', country: 'ES' },
    { code: '+7', country: 'RU' },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Auth Method Selector */}
      <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setAuthMethod('email')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            authMethod === 'email'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Mail className="h-4 w-4 inline mr-2" />
          Email
        </button>
        <button
          onClick={() => setAuthMethod('phone')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            authMethod === 'phone'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Phone className="h-4 w-4 inline mr-2" />
          Phone
        </button>
        <button
          onClick={() => setAuthMethod('social')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            authMethod === 'social'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Social
        </button>
      </div>

      {/* Email Authentication */}
      {authMethod === 'email' && (
        <form onSubmit={(e) => { e.preventDefault(); handleEmailSubmit(); }} className="space-y-4">
          {/* Demo Login Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Demo Login:</strong> Use <code className="bg-blue-100 px-1 rounded">test@example.com</code> with password <code className="bg-blue-100 px-1 rounded">testpassword</code> to test the functionality.
            </p>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter your email (try test@example.com)"
              autoComplete="email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="input-field pr-10"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => {
                // Handle forgot password
                toast.success('Password reset link sent to your email (demo)');
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>
      )}

      {/* Phone Authentication */}
      {authMethod === 'phone' && (
        <div className="space-y-4">
          {phoneStep === 'phone' ? (
            <>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex space-x-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="input-field w-24"
                    aria-label="Country code"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field flex-1"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <button
                onClick={handlePhoneSubmit}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="input-field text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {formData.otp.length === 6 && (
                      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    OTP sent to {formData.countryCode} {formData.phone}
                  </p>
                  <div className="text-sm text-gray-400">
                    {formData.otp.length}/6
                  </div>
                </div>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Demo:</strong> Use <code className="bg-blue-100 px-1 rounded">123456</code> as OTP
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setPhoneStep('phone')}
                  className="btn-secondary flex-1"
                >
                  Change Number
                </button>
                <button
                  onClick={handlePhoneSubmit}
                  disabled={isLoading}
                  className="btn-primary flex-1"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>

              <button
                onClick={() => {
                  toast.success('OTP resent successfully');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium w-full"
              >
                Resend OTP
              </button>
            </>
          )}
        </div>
      )}

      {/* Social Authentication */}
      {authMethod === 'social' && (
        <div className="space-y-4">
          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Demo Mode:</strong> Social authentication is currently in demo mode. Click any button below to test the authentication flow.
            </p>
          </div>
          
          <div className="w-full flex justify-center">
            <GoogleSignInButton
              onSuccess={(googleUser) => {
                // Show success message for demo mode
                if (googleUser.email === 'demo.google@example.com') {
                  toast.success('Google authentication successful (Demo Mode)');
                }
                onGoogleAuth(googleUser);
              }}
              onError={(error) => {
                // Don't show error toast for configuration issues in demo mode
                if (!error.includes('not configured')) {
                  toast.error(error);
                }
              }}
              text="continue_with"
              theme="outline"
              size="large"
              width={400}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-[#1877F2] text-white hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {(!process.env.REACT_APP_FACEBOOK_APP_ID || 
              process.env.REACT_APP_FACEBOOK_APP_ID === 'your-dev-facebook-app-id' || 
              process.env.REACT_APP_FACEBOOK_APP_ID.includes('mock')) 
              ? 'Continue with Facebook (Demo)' 
              : 'Continue with Facebook'}
          </button>

          <div className="w-full flex justify-center">
            <AppleSignInButton
              onSuccess={onAppleAuth}
              onError={(error) => {
                // Don't show error toast for configuration issues in demo mode
                if (!error.includes('not configured')) {
                  toast.error(error);
                }
              }}
              text="continue"
              theme="black"
              size="large"
              width={400}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <button
            onClick={() => setAuthMethod('email')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
          >
            <Mail className="w-5 h-5 mr-3" />
            Continue with Email
          </button>
        </div>
      )}
    </div>
  );
};

// Extend Window interface for Google and Facebook SDKs
declare global {
  interface Window {
    google: any;
    FB: any;
  }
}

export default SocialAuth;