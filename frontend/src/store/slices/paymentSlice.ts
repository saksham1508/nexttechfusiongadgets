import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PaymentMethod, PaymentIntent } from '../../types';
import api from '../../services/api';

interface PaymentState {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  paymentIntent: PaymentIntent | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  paymentMethods: [],
  selectedPaymentMethod: null,
  paymentIntent: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchPaymentMethods = createAsyncThunk(
  'payment/fetchPaymentMethods',
  async () => {
    const response = await api.get('/payment-methods');
    return response.data;
  }
);

export const addPaymentMethod = createAsyncThunk(
  'payment/addPaymentMethod',
  async (paymentMethodData: any) => {
    const response = await api.post('/payment-methods', paymentMethodData);
    return response.data;
  }
);

export const updatePaymentMethod = createAsyncThunk(
  'payment/updatePaymentMethod',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await api.put(`/payment-methods/${id}`, data);
    return response.data;
  }
);

export const deletePaymentMethod = createAsyncThunk(
  'payment/deletePaymentMethod',
  async (id: string) => {
    await api.delete(`/payment-methods/${id}`);
    return id;
  }
);

export const setDefaultPaymentMethod = createAsyncThunk(
  'payment/setDefaultPaymentMethod',
  async (id: string) => {
    const response = await api.put(`/payment-methods/${id}/default`);
    return response.data;
  }
);

export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async (data: { amount: number; currency?: string; paymentMethodId: string; orderId?: string }) => {
    const response = await api.post('/payment-methods/create-intent', data);
    return response.data;
  }
);

export const confirmPaymentIntent = createAsyncThunk(
  'payment/confirmPaymentIntent',
  async (paymentIntentId: string) => {
    const response = await api.post('/payment-methods/confirm-intent', { paymentIntentId });
    return response.data;
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    },
    selectPaymentMethod: (state, action) => {
      const paymentMethod = state.paymentMethods.find(pm => pm._id === action.payload);
      state.selectedPaymentMethod = paymentMethod || null;
    },
    clearSelectedPaymentMethod: (state) => {
      state.selectedPaymentMethod = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload.data;
        // Auto-select default payment method
        const defaultMethod = action.payload.data.find((pm: PaymentMethod) => pm.isDefault);
        if (defaultMethod && !state.selectedPaymentMethod) {
          state.selectedPaymentMethod = defaultMethod;
        }
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment methods';
      })
      
      // Add payment method
      .addCase(addPaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods.push(action.payload.data);
        // If this is the first payment method or set as default, select it
        if (action.payload.data.isDefault || state.paymentMethods.length === 1) {
          state.selectedPaymentMethod = action.payload.data;
        }
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add payment method';
      })
      
      // Update payment method
      .addCase(updatePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.paymentMethods.findIndex(pm => pm._id === action.payload.data._id);
        if (index !== -1) {
          state.paymentMethods[index] = action.payload.data;
        }
        if (state.selectedPaymentMethod?._id === action.payload.data._id) {
          state.selectedPaymentMethod = action.payload.data;
        }
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update payment method';
      })
      
      // Delete payment method
      .addCase(deletePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = state.paymentMethods.filter(pm => pm._id !== action.payload);
        if (state.selectedPaymentMethod?._id === action.payload) {
          state.selectedPaymentMethod = state.paymentMethods.find(pm => pm.isDefault) || null;
        }
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete payment method';
      })
      
      // Set default payment method
      .addCase(setDefaultPaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        // Update all payment methods to remove default status
        state.paymentMethods = state.paymentMethods.map(pm => ({
          ...pm,
          isDefault: pm._id === action.payload.data._id
        }));
        state.selectedPaymentMethod = action.payload.data;
      })
      .addCase(setDefaultPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to set default payment method';
      })
      
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload.data;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create payment intent';
      })
      
      // Confirm payment intent
      .addCase(confirmPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        if (state.paymentIntent) {
          state.paymentIntent.status = action.payload.data.status;
        }
      })
      .addCase(confirmPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to confirm payment';
      });
  },
});

export const { 
  clearError, 
  clearPaymentIntent, 
  selectPaymentMethod, 
  clearSelectedPaymentMethod 
} = paymentSlice.actions;

export default paymentSlice.reducer;