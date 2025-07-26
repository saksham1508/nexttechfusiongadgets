import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
    api.post('/cart', { productId, quantity }),
  updateCartItem: (id: string, quantity: number) => 
    api.put(`/cart/${id}`, { quantity }),
  removeFromCart: (id: string) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
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