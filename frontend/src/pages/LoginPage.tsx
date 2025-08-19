import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { login, loginWithGoogle, loginWithFacebook, loginWithApple, loginWithPhone, logout, logoutSync, reset } from '../store/slices/authSlice';
import { fetchCart, addToCart } from '../store/slices/cartSlice';
import { clearAllAuthData } from '../utils/authUtils';
import SocialAuth from '../components/SocialAuth';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  const [isVendorLogin, setIsVendorLogin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on component mount
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser && !user) {
        // User data exists in localStorage but not in Redux state
        // This can happen after page refresh
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.user) {
            // Redirect to home page since user is already logged in
            toast.success('Welcome back!');
            navigate('/');
            return;
          }
        } catch (error) {
          // Invalid user data in localStorage, clear it
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    };

    checkAuthStatus();

    if (user) {
      // Check if user is a vendor and redirect accordingly
      if (user.role === 'seller' || isVendorLogin) {
        navigate('/vendor/dashboard');
        return;
      }
      
      // Migrate temporary cart items to authenticated cart
      const migrateTempCart = async () => {
        const tempCart = localStorage.getItem('tempCart');
        if (tempCart) {
          try {
            const tempItems = JSON.parse(tempCart);
            if (tempItems.length > 0) {
              // Add each temp cart item to the authenticated cart
              for (const item of tempItems) {
                try {
                  await dispatch(addToCart({ 
                    productId: item.productId, 
                    quantity: item.quantity 
                  })).unwrap();
                } catch (error) {
                  console.error('Failed to migrate cart item:', error);
                }
              }
              // Clear temporary cart after migration
              localStorage.removeItem('tempCart');
              toast.success(`Migrated ${tempItems.length} items to your cart`);
            }
          } catch (error) {
            console.error('Error migrating temp cart:', error);
          }
        }
        
        // Fetch cart data after migration
        dispatch(fetchCart());
      };
      
      migrateTempCart();
      navigate('/');
    }
    if (error) {
      // Don't show Google Client ID configuration errors as they're expected in demo mode
      if (!error.includes('Google Client ID not configured') && !error.includes('not configured')) {
        toast.error(error);
      }
      dispatch(reset());
    }
  }, [user, error, navigate, dispatch]);

  const handleEmailAuth = (email: string, password: string) => {
    dispatch(login({ email, password }));
  };

  const handleGoogleAuth = (googleUser: any) => {
    dispatch(loginWithGoogle(googleUser));
  };

  const handleFacebookAuth = (token: string) => {
    dispatch(loginWithFacebook(token));
  };

  const handleAppleAuth = (appleData: any) => {
    dispatch(loginWithApple(appleData));
  };

  const handlePhoneAuth = (phone: string, otp: string) => {
    dispatch(loginWithPhone({ phone, otp }));
  };

  const handleLogout = () => {
    console.log('🔄 LoginPage logout clicked');
    
    try {
      // Use synchronous logout for immediate effect
      dispatch(logoutSync());
      
      // Also dispatch async logout as backup
      dispatch(logout());
      
      // Clear all auth data using utility
      clearAllAuthData();
      
      toast.success('Logged out successfully');
      
      console.log('✅ LoginPage logout completed');
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('❌ LoginPage logout error:', error);
      // Fallback - just clear everything and reload
      clearAllAuthData();
      toast.success('Logged out successfully');
      window.location.reload();
    }
  };

  // If user is already logged in, show a different UI
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              You're already logged in!
            </h2>
            <p className="text-gray-600 mb-4">
              Welcome back, {user.name}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                You are currently signed in as <strong>{user.email}</strong>
              </p>
              
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="btn-primary w-full"
                >
                  Go to Home
                </Link>
                
                <Link
                  to="/profile"
                  className="btn-secondary w-full"
                >
                  View Profile
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 border border-red-300 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`mx-auto h-16 w-16 ${isVendorLogin ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} rounded-2xl flex items-center justify-center mb-4`}>
            {isVendorLogin ? (
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isVendorLogin ? 'Vendor Login' : 'Welcome back!'}
          </h2>
          <p className="text-gray-600">
            {isVendorLogin ? 'Sign in to your vendor account to manage your store' : 'Sign in to your account to continue shopping'}
          </p>
          
          {/* Login Type Toggle */}
          <div className="mt-6 flex justify-center">
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button
                onClick={() => setIsVendorLogin(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  !isVendorLogin 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Customer Login
              </button>
              <button
                onClick={() => setIsVendorLogin(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isVendorLogin 
                    ? 'bg-white text-amber-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Become a Vendor
              </button>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Quick role shortcuts */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link to="/admin/inventory" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-center font-medium">
              Admin Login
            </Link>
            <Link to="/vendor/dashboard" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-center font-medium">
              Vendor Login
            </Link>
          </div>

          <SocialAuth
            onEmailAuth={handleEmailAuth}
            onGoogleAuth={handleGoogleAuth}
            onFacebookAuth={handleFacebookAuth}
            onAppleAuth={handleAppleAuth}
            onPhoneAuth={handlePhoneAuth}
            isLoading={isLoading}
          />

          {/* Additional Options */}
          <div className="mt-6 space-y-4">
            {isVendorLogin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-amber-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 mb-1">Vendor Account Required</h4>
                    <p className="text-sm text-amber-700">
                      Use your vendor credentials to access the dashboard. Don't have a vendor account? Contact support to get started.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className={`${isVendorLogin ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'} font-medium`}
              >
                Forgot password?
              </Link>
              <Link
                to="/register"
                className={`${isVendorLogin ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700'} font-medium`}
              >
                {isVendorLogin ? 'Apply as Vendor' : 'Create account'}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
