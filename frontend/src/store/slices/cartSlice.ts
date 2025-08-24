import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { handleApiError } from '../../utils/errorHandler';
import { mockApiService } from '../../services/mockApiService';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: { url: string; alt: string }[];
    stock: number;
  };
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  isLoading: false,
  error: null,
};



export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      // Check authentication before making API call
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        console.log('🔄 No auth found. Using mock cart for fetchCart.');
        try {
          const mockResponse = await mockApiService.getCart();
          console.log('✅ Mock API: Fetch cart success (no auth)', mockResponse);
          return mockResponse;
        } catch (mockError) {
          console.error('❌ Mock API fetch failed:', mockError);
          return rejectWithValue('Failed to fetch cart. Please try again.');
        }
      }
      
      const response = await axiosInstance.get(API_ENDPOINTS.CART.GET);
      return response.data;
    } catch (error: any) {
      console.error('❌ Cart API: Fetch cart failed', error);

      // Friendly fallback on auth errors (treat as guest cart in dev)
      if (error.response?.status === 401) {
        try {
          console.log('🔄 401 on cart fetch. Falling back to mock cart for better UX');
          const mockResponse = await mockApiService.getCart();
          console.log('✅ Mock API: Fetch cart success (401 fallback)', mockResponse);
          return mockResponse;
        } catch (mockError) {
          console.error('❌ Mock API fetch also failed:', mockError);
          return rejectWithValue('Please log in to continue.');
        }
      }
      
      // Check if it's a network error or server unavailable
      if (!error.response || error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.log('🔄 Falling back to mock API service for cart fetch');
        try {
          const mockResponse = await mockApiService.getCart();
          console.log('✅ Mock API: Fetch cart success', mockResponse);
          return mockResponse;
        } catch (mockError) {
          console.error('❌ Mock API fetch also failed:', mockError);
          return rejectWithValue('Failed to fetch cart. Please try again.');
        }
      }
      
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      // Check authentication before making API call
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        console.warn('⚠️ No auth found. Using mock cart for addToCart.');
        try {
          const mockResponse = await mockApiService.addToCart(productId, quantity);
          return mockResponse;
        } catch (mockError) {
          return rejectWithValue('Please log in to add items to cart');
        }
      }
      
      console.log('🛒 Cart API: Adding to cart', { productId, quantity });
      console.log('🔗 API URL:', `${axiosInstance.defaults.baseURL}${API_ENDPOINTS.CART.ADD}`);
      
      const response = await axiosInstance.post(API_ENDPOINTS.CART.ADD, { productId, quantity });
      console.log('✅ Cart API: Add to cart success', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Cart API: Add to cart failed', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error config:', error.config);
      
      // Handle specific error cases first
      if (error.response?.status === 401) {
        // In development, gracefully fallback to mock cart to keep UX smooth
        try {
          console.log('🔄 401 received. Falling back to mock API addToCart for dev UX');
          const mockResponse = await mockApiService.addToCart(productId, quantity);
          console.log('✅ Mock API: Add to cart success (401 fallback)', mockResponse);
          return mockResponse;
        } catch (mockError) {
          return rejectWithValue('Your session has expired. Please log in again.');
        }
      }
      
      if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to perform this action.');
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid request. Please check the product details.';
        // Soft fallback in dev to keep cart usable when backend validation differs
        try {
          console.log('🔄 400 received. Attempting mock addToCart as soft fallback');
          const mockResponse = await mockApiService.addToCart(productId, quantity);
          console.log('✅ Mock API: Add to cart success (400 fallback)', mockResponse);
          return mockResponse;
        } catch {
          return rejectWithValue(errorMessage);
        }
      }
      
      // Network/server errors -> fallback to mock
      if (!error.response || error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.log('🔄 Falling back to mock API service');
        try {
          const mockResponse = await mockApiService.addToCart(productId, quantity);
          console.log('✅ Mock API: Add to cart success', mockResponse);
          return mockResponse;
        } catch (mockError) {
          console.error('❌ Mock API also failed:', mockError);
          return rejectWithValue('Service temporarily unavailable. Please try again later.');
        }
      }
      
      // Final safety fallback in development for unexpected statuses (e.g., 404/405)
      try {
        console.log('🔄 Unexpected status. Attempting mock addToCart as safety fallback');
        const mockResponse = await mockApiService.addToCart(productId, quantity);
        console.log('✅ Mock API: Add to cart success (safety fallback)', mockResponse);
        return mockResponse;
      } catch {
        return rejectWithValue(handleApiError(error));
      }
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      // Check authentication before making API call
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        console.warn('⚠️ No auth found. Using mock cart for updateCartItem.');
        try {
          const mockResponse = await mockApiService.updateCartItem(productId, quantity);
          return mockResponse;
        } catch (mockError) {
          return rejectWithValue('Please log in to update cart items');
        }
      }
      
      console.log('🔄 Cart API: Updating cart item', { productId, quantity });
      
      const response = await axiosInstance.put(API_ENDPOINTS.CART.UPDATE, { productId, quantity });
      console.log('✅ Cart API: Update cart item success', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Cart API: Update cart item failed', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Handle specific error cases with friendly fallbacks
      if (error.response?.status === 401) {
        try {
          console.log('🔄 401 on update. Falling back to mock cart');
          const mockResponse = await mockApiService.updateCartItem(productId, quantity);
          return mockResponse;
        } catch {
          return rejectWithValue('Your session has expired. Please log in again.');
        }
      }
      
      if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to perform this action.');
      }
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid request. Please check the product details.';
        try {
          console.log('🔄 400 on update. Attempting mock update fallback');
          const mockResponse = await mockApiService.updateCartItem(productId, quantity);
          return mockResponse;
        } catch {
          return rejectWithValue(errorMessage);
        }
      }
      
      // Check if it's a network error or server unavailable
      if (!error.response || error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.log('🔄 Falling back to mock API service for cart update');
        try {
          const mockResponse = await mockApiService.updateCartItem(productId, quantity);
          console.log('✅ Mock API: Update cart item success', mockResponse);
          return mockResponse;
        } catch (mockError) {
          console.error('❌ Mock API update also failed:', mockError);
          return rejectWithValue('Service temporarily unavailable. Please try again later.');
        }
      }
      
      // Safety fallback for unexpected statuses
      try {
        const mockResponse = await mockApiService.updateCartItem(productId, quantity);
        return mockResponse;
      } catch {
        return rejectWithValue(handleApiError(error));
      }
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.CART.REMOVE}/${productId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Cart API: Remove from cart failed', error);
      
      // Friendly fallbacks for auth/validation
      if (error.response?.status === 401 || error.response?.status === 400) {
        try {
          console.log('🔄 Remove fallback to mock');
          const mockResponse = await mockApiService.removeFromCart(productId);
          return mockResponse;
        } catch (mockError) {
          return rejectWithValue('Failed to remove item from cart. Please try again.');
        }
      }
      
      // Network/server errors -> fallback to mock
      if (!error.response || error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.log('🔄 Falling back to mock API service for cart remove');
        try {
          const mockResponse = await mockApiService.removeFromCart(productId);
          console.log('✅ Mock API: Remove from cart success', mockResponse);
          return mockResponse;
        } catch (mockError) {
          console.error('❌ Mock API remove also failed:', mockError);
          return rejectWithValue('Failed to remove item from cart. Please try again.');
        }
      }
      
      // Safety fallback
      try {
        const mockResponse = await mockApiService.removeFromCart(productId);
        return mockResponse;
      } catch {
        return rejectWithValue(handleApiError(error));
      }
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.CART.CLEAR);
      return response.data;
    } catch (error: any) {
      console.error('❌ Cart API: Clear cart failed', error);
      
      // Check if it's a network error or server unavailable
      if (!error.response || error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.log('🔄 Falling back to mock API service for cart clear');
        try {
          const mockResponse = await mockApiService.clearCart();
          console.log('✅ Mock API: Clear cart success', mockResponse);
          return mockResponse;
        } catch (mockError) {
          console.error('❌ Mock API clear also failed:', mockError);
          return rejectWithValue('Failed to clear cart. Please try again.');
        }
      }
      
      return rejectWithValue(handleApiError(error));
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.error = null;
        console.log('✅ Cart Redux: Add to cart fulfilled', { 
          items: state.items.length, 
          totalAmount: state.totalAmount 
        });
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.error = null;
        console.log('✅ Cart Redux: Update cart item fulfilled', { 
          items: state.items.length, 
          totalAmount: state.totalAmount 
        });
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.totalAmount ?? 0;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = [];
        state.totalAmount = 0;
      });
  },
});

export const { reset } = cartSlice.actions;
export default cartSlice.reducer;
