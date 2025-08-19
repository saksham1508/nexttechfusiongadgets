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
    // Get token from localStorage - try direct token first
    let token = localStorage.getItem('token');
    
    // If no direct token, try to get from user object
    if (!token) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          token = userData.token;
          console.log('🔑 Axios: Token extracted from user object:', token ? token.substring(0, 20) + '...' : 'null');
        } catch (error) {
          console.error('❌ Axios: Error parsing user data:', error);
        }
      }
    } else {
      console.log('🔑 Axios: Token found directly in localStorage:', token.substring(0, 20) + '...');
    }
    
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
    
    // Handle 401 errors by clearing auth data
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Don't redirect automatically - let the component handle it
      // This prevents unwanted page refreshes when cart operations fail
      console.log('Authentication failed - token cleared');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;