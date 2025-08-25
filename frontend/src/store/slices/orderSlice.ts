import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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

const API_URL = getApiUrl();

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
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: getAuthHeaders(),
      });
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
      const response = await axios.get(`${API_URL}/orders/myorders`, {
        headers: getAuthHeaders(),
      });
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
      const response = await axios.get(`${API_URL}/orders/${id}`, {
        headers: getAuthHeaders(),
      });
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
