import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { handleApiError } from '../../utils/errorHandler';

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
      const response = await axiosInstance.get(API_ENDPOINTS.CART.GET);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CART.ADD, { productId, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.CART.UPDATE, { productId, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
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
      return rejectWithValue(handleApiError(error));
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
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = [];
        state.totalAmount = 0;
      });
  },
});

export const { reset } = cartSlice.actions;
export default cartSlice.reducer;
