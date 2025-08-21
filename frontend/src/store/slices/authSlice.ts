import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';
import authService from '../../services/authService';
import { API_ENDPOINTS } from '../../config/api';
import { handleApiError } from '../../utils/errorHandler';

interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  authProvider?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Add updateProfile async thunk
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<AuthUser>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

const getInitialUser = (): AuthUser | null => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Handle both direct user object and wrapped user object
      const user = userData.user || userData;
      
      // Ensure token is available in localStorage if it exists in the user data
      if (userData.token && !localStorage.getItem('token')) {
        localStorage.setItem('token', userData.token);
      }
      
      return user;
    }
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    // Clear invalid data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  return null;
};

const initialState: AuthState = {
  user: getInitialUser(),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Check if this is a vendor login attempt with demo credentials
      if (email === 'vendor1@example.com' && password === 'Vendor@123') {
        console.log('Using mock vendor login for demo credentials');
        // Create mock vendor user data aligned with backend mock vendor
        const mockVendorData = {
          user: {
            _id: 'vendor_1',
            name: 'Demo Vendor',
            email: 'vendor1@example.com',
            role: 'seller',
            avatar: 'https://via.placeholder.com/150/FF5722/FFFFFF?text=V',
          },
          token: 'mock_vendor_token_vendor_1'
        };
        
        // Store both user data and token
        localStorage.setItem('user', JSON.stringify(mockVendorData));
        localStorage.setItem('token', mockVendorData.token);
        
        return mockVendorData;
      }
      
      // Regular login flow
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const userData = response.data;
      
      // Store both user data and token
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      
      return userData;
    } catch (error: any) {
      // If API call fails but it's the demo vendor credentials, use mock data
      if (email === 'vendor1@example.com' && password === 'Vendor@123') {
        console.log('API call failed but using mock vendor login for demo credentials');
        // Create mock vendor user data aligned with backend mock vendor
        const mockVendorData = {
          user: {
            _id: 'vendor_1',
            name: 'Demo Vendor',
            email: 'vendor1@example.com',
            role: 'seller',
            avatar: 'https://via.placeholder.com/150/FF5722/FFFFFF?text=V',
          },
          token: 'mock_vendor_token_vendor_1'
        };
        
        // Store both user data and token
        localStorage.setItem('user', JSON.stringify(mockVendorData));
        localStorage.setItem('token', mockVendorData.token);
        
        return mockVendorData;
      }
      
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string; phone: string; role?: string }, { rejectWithValue }) => {
    try {
      // Check if this is a vendor registration
      if (userData.role === 'seller') {
        console.log('Using mock vendor registration');
        // For demo, align with backend mock vendor identity
        const mockVendorData = {
          user: {
            _id: 'vendor_1',
            name: userData.name || 'Demo Vendor',
            email: userData.email,
            phone: userData.phone,
            role: 'seller',
            avatar: 'https://via.placeholder.com/150/FF5722/FFFFFF?text=V',
          },
          token: 'mock_vendor_token_vendor_1'
        };
        
        // Store both user data and token
        localStorage.setItem('user', JSON.stringify(mockVendorData));
        localStorage.setItem('token', mockVendorData.token);
        
        return mockVendorData;
      }
      
      // Regular registration flow
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      const responseData = response.data;
      
      // Store both user data and token
      localStorage.setItem('user', JSON.stringify(responseData));
      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
      }
      
      return responseData;
    } catch (error: any) {
      // If API call fails but it's a vendor registration, use mock data
      if (userData.role === 'seller') {
        console.log('API call failed but using mock vendor registration');
        // Create mock vendor user data
        const mockVendorData = {
          user: {
            _id: 'vendor_' + Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: 'seller',
            avatar: 'https://via.placeholder.com/150/FF5722/FFFFFF?text=V',
          },
          token: 'mock_vendor_token_' + Date.now()
        };
        
        // Store both user data and token
        localStorage.setItem('user', JSON.stringify(mockVendorData));
        localStorage.setItem('token', mockVendorData.token);
        
        return mockVendorData;
      }
      
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Clear all authentication-related data
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  
  // Clear any temporary cart data if user wants to start fresh
  // Note: We keep tempCart as it might contain items user wants to keep
  
  return null;
});

// Google Authentication
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleUser: any, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithGoogle(googleUser);
      
      // Store both user data and token properly
      localStorage.setItem('user', JSON.stringify(response));
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      console.log('🔍 Google Auth Debug:');
      console.log('Redux User ID:', response.user._id);
      console.log('Redux User Name:', response.user.name);
      console.log('Raw Token:', response.token ? '✅ Present' : '❌ None');
      console.log('Raw User:', response.user ? '✅ Present' : '❌ None');
      console.log('Parsed User Structure:');
      console.log(JSON.stringify(response, null, 2));
      console.log('Final Auth Result:', response.user && response.token ? '✅ Authenticated' : '❌ Failed');
      console.log('Final User ID:', response.user._id);
      console.log('Final User Name:', response.user.name);
      console.log('Final Token:', response.token ? '✅ Present' : '❌ None');
      console.log('Token Preview:', response.token ? response.token.substring(0, 20) + '...' : 'None');
      
      return response;
    } catch (error: any) {
      // Fallback for development/demo
      console.warn('Google auth API not available, using mock data');
      const mockResponse = {
        user: {
          _id: 'google_mock_google_' + Date.now(),
          name: googleUser.name || 'Demo Google User',
          email: googleUser.email || 'demo.google@example.com',
          role: 'customer',
          avatar: googleUser.picture || 'https://via.placeholder.com/150/4285F4/FFFFFF?text=DG',
          authProvider: 'google'
        },
        token: 'mock_google_token_' + Date.now()
      };
      
      // Store both user data and token properly
      localStorage.setItem('user', JSON.stringify(mockResponse));
      localStorage.setItem('token', mockResponse.token);
      
      console.log('🔍 Google Auth Debug:');
      console.log('Redux User ID:', mockResponse.user._id);
      console.log('Redux User Name:', mockResponse.user.name);
      console.log('Raw Token:', mockResponse.token ? '✅ Present' : '❌ None');
      console.log('Raw User:', mockResponse.user ? '✅ Present' : '❌ None');
      console.log('Parsed User Structure:');
      console.log(JSON.stringify(mockResponse, null, 2));
      console.log('Final Auth Result:', mockResponse.user && mockResponse.token ? '✅ Authenticated' : '❌ Failed');
      console.log('Final User ID:', mockResponse.user._id);
      console.log('Final User Name:', mockResponse.user.name);
      console.log('Final Token:', mockResponse.token ? '✅ Present' : '❌ None');
      console.log('Token Preview:', mockResponse.token ? mockResponse.token.substring(0, 20) + '...' : 'None');
      
      return mockResponse;
    }
  }
);

// Facebook Authentication
export const loginWithFacebook = createAsyncThunk(
  'auth/loginWithFacebook',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FACEBOOK, { token });
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Apple Authentication
export const loginWithApple = createAsyncThunk(
  'auth/loginWithApple',
  async (appleData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.APPLE, appleData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Phone Authentication
export const loginWithPhone = createAsyncThunk(
  'auth/loginWithPhone',
  async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.PHONE, { phone, otp });
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Send OTP for phone authentication
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_OTP, { phone });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    logoutSync: (state) => {
      // Synchronous logout action
      state.user = null;
      state.isLoading = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      
      // Clear any persisted auth data
      localStorage.removeItem('persist:root');
      localStorage.removeItem('persist:auth');
      
      console.log('🧹 Auth data cleared from localStorage and Redux');
    },
    syncFromLocalStorage: (state) => {
      // Sync auth state from localStorage
      const user = getInitialUser();
      if (user) {
        state.user = user;
        state.isLoading = false;
        state.error = null;
        console.log('🔄 Auth state synced from localStorage');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Google Authentication
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        // Ensure token is stored in localStorage for Google auth
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Facebook Authentication
      .addCase(loginWithFacebook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(loginWithFacebook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Apple Authentication
      .addCase(loginWithApple.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithApple.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user || action.payload.user;
      })
      .addCase(loginWithApple.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Phone Authentication
      .addCase(loginWithPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(loginWithPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reset, logoutSync, syncFromLocalStorage } = authSlice.actions;
export default authSlice.reducer;
