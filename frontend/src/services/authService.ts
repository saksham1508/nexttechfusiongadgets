import axios from 'axios';
import { mockFirebaseAuth, MockRecaptchaVerifier } from '../config/firebase';
import { API_URL } from '../config/api';

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    avatar?: string;
    authProvider?: string;
  };
  token: string;
}

class AuthService {
  // Email/Password Authentication
  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Google Authentication
  async loginWithGoogle(googleUser: any): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/google`, {
        idToken: googleUser.idToken, // send ID token for verification
        // Keep fields for potential backend fallbacks/logging
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        givenName: googleUser.given_name,
        familyName: googleUser.family_name
      });
      return response.data;
    } catch (error: any) {
      // Remove mock fallback: fail fast
      const msg = error.response?.data?.message || 'Google authentication failed';
      throw new Error(msg);
    }
  }

  // Facebook Authentication
  async loginWithFacebook(accessToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/facebook`, {
        accessToken
      });
      return response.data;
    } catch (error: any) {
      // Mock response for development
      console.warn('Facebook auth API not available, using mock data');
      return {
        user: {
          _id: 'facebook_' + Date.now(),
          name: 'Facebook User',
          email: 'user@facebook.com',
          role: 'user',
          authProvider: 'facebook'
        },
        token: 'mock_facebook_token_' + Date.now()
      };
    }
  }

  // Phone Authentication - Send OTP
  async sendOTP(phoneNumber: string): Promise<{ verificationId: string }> {
    try {
      const response = await axios.post(`${API_URL}/auth/send-otp`, {
        phoneNumber
      });
      return response.data;
    } catch (error: any) {
      // Mock Firebase phone authentication
      console.warn('OTP API not available, using mock Firebase');
      
      // Create a mock recaptcha verifier
      const recaptchaVerifier = new MockRecaptchaVerifier('recaptcha-container');
      
      // Use mock Firebase auth
      const confirmationResult = await mockFirebaseAuth.signInWithPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );
      
      return {
        verificationId: confirmationResult.verificationId
      };
    }
  }

  // Phone Authentication - Verify OTP
  async verifyOTP(verificationId: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        verificationId,
        otp
      });
      return response.data;
    } catch (error: any) {
      // Mock verification
      console.warn('OTP verification API not available, using mock verification');
      
      if (otp === '123456') {
        return {
          user: {
            _id: 'phone_' + Date.now(),
            name: 'Phone User',
            email: verificationId.replace(/\D/g, '') + '@phone.com',
            phone: '+1234567890', // Mock phone number
            role: 'user',
            authProvider: 'phone'
          },
          token: 'mock_phone_token_' + Date.now()
        };
      } else {
        throw new Error('Invalid OTP. Use 123456 for demo.');
      }
    }
  }

  // Register with Email
  async registerWithEmail(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      // Even if API call fails, we still want to clear local storage
      console.warn('Logout API call failed, but clearing local storage');
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const userData = JSON.parse(userStr);
      // Handle both direct user object and wrapped user object
      return userData.user || userData;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = this.getToken();
    return !!user && !!token;
  }

  // Get auth token
  getToken(): string | null {
    // First try to get token from separate localStorage item
    const directToken = localStorage.getItem('token');
    if (directToken) return directToken;
    
    // Fallback to token in user object
    const user = this.getCurrentUser();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        return userData.token || user?.token || null;
      } catch (error) {
        console.error('Error parsing user data for token:', error);
        return null;
      }
    }
    
    return null;
  }

  // Set auth token in axios headers
  setAuthToken(token: string) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  // Initialize auth service
  init() {
    const token = this.getToken();
    if (token) {
      this.setAuthToken(token);
    }
  }
}

export default new AuthService();