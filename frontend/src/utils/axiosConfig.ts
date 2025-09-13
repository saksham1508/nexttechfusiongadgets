import axios from 'axios';
import { API_URL } from '../config/api';
import { handleApiError } from './errorHandler';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Helper: attempt to extract token from various stored shapes
    const extractToken = (raw: any): string | null => {
      if (!raw) return null;
      try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return (
          obj?.token ||
          obj?.accessToken ||
          obj?.data?.token ||
          obj?.data?.accessToken ||
          obj?.data?.tokens?.accessToken ||
          obj?.tokens?.accessToken ||
          obj?.user?.token ||
          null
        );
      } catch {
        return null;
      }
    };

    // Get token from localStorage - try direct token first
    let token = localStorage.getItem('token');

    // If no direct token, try to get from user object (handles nested backend shapes)
    if (!token) {
      const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
      const extracted = extractToken(userRaw);
      if (extracted) {
        token = extracted;
        // Persist for future requests
        try { localStorage.setItem('token', token); } catch {}
        console.log('🔑 Axios: Token extracted from stored user payload:', token.substring(0, 20) + '...');
      }
    } else {
      console.log('🔑 Axios: Token found directly in localStorage:', token.substring(0, 20) + '...');
    }

    // Development fallback: synthesize mock vendor token if user is a seller
    if (!token) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          const userObj = parsed.user || parsed; // support wrapped or direct
          if (process.env.NODE_ENV !== 'production' && userObj?.role === 'seller') {
            const vendorId = userObj._id || 'vendor_1';
            token = `mock_vendor_token_${vendorId}`;
            localStorage.setItem('token', token);
            console.log('🔧 Axios: Generated mock vendor token for seller (dev only):', vendorId);
          }
        }
      } catch (e) {
        console.warn('Axios: Failed to parse user for fallback token');
      }
    }

    // If this is a vendor-protected mutating request and user is a seller, force a vendor token
    try {
      const urlPath = (config.url || '').toString();
      const method = (config.method || 'get').toLowerCase();
      const isMutating = method !== 'get';
      const targetsVendorApis = urlPath.startsWith('/products') || urlPath.startsWith('/vendor');
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      const userObj = parsed?.user || parsed;
      const isSeller = userObj?.role === 'seller';
      const currentIsVendorToken = typeof token === 'string' && token.startsWith('mock_vendor_token_');
      if (process.env.NODE_ENV !== 'production' && isMutating && targetsVendorApis && isSeller && !currentIsVendorToken) {
        const vendorId = userObj._id || 'vendor_1';
        token = `mock_vendor_token_${vendorId}`;
        localStorage.setItem('token', token);
        console.log('🛡️ Axios: Overriding token for vendor mutating request as seller (dev only):', vendorId, urlPath);
      }
    } catch {}

    // Add token to headers if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Axios: Authorization header set for:', config.url);
    } else {
      console.warn('⚠️ Axios: No token found for API request:', config.url);
    }
    
    // Ensure content type is set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    console.log('📤 Axios: Request config:', {
      url: config.url,
      method: config.method,
      hasAuth: !!config.headers.Authorization,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API error details:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.response?.data,
      networkError: !error.response,
      errorCode: error.code,
      errorMessage: error.message
    });
    
    // Do not clear auth on generic 401s; let UI handle and prompt gracefully
    // Some dev/mock endpoints may return 401 even when user is logged in
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized from API: leaving stored auth intact; UI will handle re-auth if needed');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;