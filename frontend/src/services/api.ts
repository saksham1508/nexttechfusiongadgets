import axios from 'axios';

// Function to get API URL with fallback
const getApiUrl = () => {
  const envApiUrl = process.env.REACT_APP_API_URL;
  const fallbackUrl = 'http://localhost:5000/api';
  
  console.log('🔧 Environment Variables Check:', {
    REACT_APP_API_URL: envApiUrl,
    NODE_ENV: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
  });
  
  if (!envApiUrl || envApiUrl === 'undefined' || envApiUrl.trim() === '') {
    console.warn('⚠️ REACT_APP_API_URL is not set or invalid, using fallback:', fallbackUrl);
    return fallbackUrl;
  }
  
  console.log('✅ Using API URL from environment:', envApiUrl);
  return envApiUrl;
};

const API_URL = getApiUrl();

// Create axios instance with guaranteed URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the full URL being called
    const fullURL = `${config.baseURL}${config.url}`;
    console.log('🌐 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: fullURL,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('API: 401 Unauthorized - Token may be invalid or expired');
      // Note: We don't automatically redirect to login anymore
      // Let the UI components handle authentication state appropriately
      // This prevents unwanted redirects during checkout and other flows
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData: any) => api.put('/auth/profile', userData),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
};

export const productAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  searchProducts: (query: string) => api.get(`/products/search?q=${query}`),
  getTrendingProducts: () => api.get('/products/trending'),
  createProduct: (productData: any) => api.post('/products', productData),
  updateProduct: (id: string, productData: any) => api.put(`/products/${id}`, productData),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  addReview: (id: string, reviewData: any) => api.post(`/products/${id}/review`, reviewData),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId: string, quantity: number) => 
    api.post('/cart/add', { productId, quantity }),
  updateCartItem: (productId: string, quantity: number) => 
    api.put('/cart/update', { productId, quantity }),
  removeFromCart: (productId: string) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

export const orderAPI = {
  getOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  createOrder: (orderData: any) => api.post('/orders', orderData),
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
  trackOrder: (id: string) => api.get(`/orders/${id}/track`),
  rateOrder: (id: string, rating: number, review?: string) => 
    api.post(`/orders/${id}/rate`, { rating, review }),
};

export const deliveryAPI = {
  checkAvailability: (coordinates: any) => api.post('/delivery/check', { coordinates }),
  getDeliverySlots: (addressId?: string) => api.get('/delivery/slots', { params: { addressId } }),
  getDeliveryZones: () => api.get('/delivery/zones'),
};

export const flashSaleAPI = {
  getActiveFlashSales: () => api.get('/flash-sales/active'),
  getUpcomingFlashSales: () => api.get('/flash-sales/upcoming/list'),
  getFlashSale: (id: string) => api.get(`/flash-sales/${id}`),
  recordPurchase: (id: string, productId: string, quantity: number) => 
    api.post(`/flash-sales/${id}/purchase`, { productId, quantity }),
};

export const couponAPI = {
  getCoupons: () => api.get('/coupons'),
  validateCoupon: (code: string, orderValue: number, products?: any[], paymentMethod?: string) => 
    api.post('/coupons/validate', { code, orderValue, products, paymentMethod }),
  applyCoupon: (code: string, orderValue: number, discountApplied: number) => 
    api.post('/coupons/apply', { code, orderValue, discountApplied }),
  getUserCoupons: () => api.get('/coupons/user/available'),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (ids: string[]) => api.post('/notifications/mark-read', { ids }),
};