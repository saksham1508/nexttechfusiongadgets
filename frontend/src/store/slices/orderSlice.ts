import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';

declare const process: { env: { NODE_ENV: string; REACT_APP_API_URL: string } };

const getApiUrl = (): string => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return process.env.REACT_APP_API_URL || 'https://api.nexttechfusiongadgets.com';
    case 'development':
      // Point to backend server in dev by default
      return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    case 'test':
      return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    default:
      return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }
};

// Base URL is already embedded in the shared axios instance (services/api)
const API_URL = getApiUrl(); // Kept for possible non-shared uses, but not needed for order calls

interface Order {
  _id: string;
  orderItems: any[];
  shippingAddress: any;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  status: string;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  order: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  order: null,
  isLoading: false,
  error: null,
};

const getAuthHeaders = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state?.auth?.token
        || state?.auth?.user?.token
        || localStorage.getItem('token')
        || sessionStorage.getItem('token')
        || (() => {
             try {
               const u = localStorage.getItem('user') || sessionStorage.getItem('user');
               return u ? JSON.parse(u)?.token : null;
             } catch { return null; }
           })();

      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await axiosInstance.post(`/orders`, orderData, { headers });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders/myorders`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);
// If you want to keep fetchUserOrders, add it as an alias
export { fetchMyOrders as fetchUserOrders };

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.order = action.payload;
      });
  },
});

export const { reset } = orderSlice.actions;
export default orderSlice.reducer;
