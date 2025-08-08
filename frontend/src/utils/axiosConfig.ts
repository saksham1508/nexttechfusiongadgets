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
    // Get token from localStorage
    let token = localStorage.getItem('token');
    
    // If no direct token, try to get from user object
    if (!token) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          token = userData.token;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    
    // Add token to headers if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found for API request:', config.url);
    }
    
    // Ensure content type is set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
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
    return response;
  },
  (error) => {
    console.error('❌ API error:', error.response?.status, error.response?.data?.message || error.response?.data, error.config?.url);
    
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