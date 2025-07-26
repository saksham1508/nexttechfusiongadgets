import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { couponAPI } from '../../services/api';
import { Coupon } from '../../types';

interface CouponValidation {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    title: string;
    discountType: string;
    discountValue: number;
  };
  discountAmount: number;
  finalAmount: number;
  message?: string;
}

interface CouponState {
  availableCoupons: Coupon[];
  userCoupons: Coupon[];
  appliedCoupon: CouponValidation | null;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
}

const initialState: CouponState = {
  availableCoupons: [],
  userCoupons: [],
  appliedCoupon: null,
  isLoading: false,
  isValidating: false,
  error: null,
};

// Async thunks
export const fetchAvailableCoupons = createAsyncThunk(
  'coupon/fetchAvailable',
  async () => {
    const response = await couponAPI.getCoupons();
    return response.data;
  }
);

export const fetchUserCoupons = createAsyncThunk(
  'coupon/fetchUserCoupons',
  async () => {
    const response = await couponAPI.getUserCoupons();
    return response.data;
  }
);

export const validateCoupon = createAsyncThunk(
  'coupon/validate',
  async ({ 
    code, 
    orderValue, 
    products, 
    paymentMethod 
  }: { 
    code: string; 
    orderValue: number; 
    products?: any[]; 
    paymentMethod?: string; 
  }) => {
    const response = await couponAPI.validateCoupon(code, orderValue, products, paymentMethod);
    return response.data;
  }
);

export const applyCoupon = createAsyncThunk(
  'coupon/apply',
  async ({ 
    code, 
    orderValue, 
    discountApplied 
  }: { 
    code: string; 
    orderValue: number; 
    discountApplied: number; 
  }) => {
    const response = await couponAPI.applyCoupon(code, orderValue, discountApplied);
    return response.data;
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAppliedCoupon: (state, action: PayloadAction<CouponValidation>) => {
      state.appliedCoupon = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available coupons
      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableCoupons = action.payload;
      })
      .addCase(fetchAvailableCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch coupons';
      })
      // Fetch user coupons
      .addCase(fetchUserCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userCoupons = action.payload;
      })
      .addCase(fetchUserCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user coupons';
      })
      // Validate coupon
      .addCase(validateCoupon.pending, (state) => {
        state.isValidating = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.isValidating = false;
        state.appliedCoupon = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.isValidating = false;
        state.error = action.error.message || 'Failed to validate coupon';
        state.appliedCoupon = null;
      })
      // Apply coupon
      .addCase(applyCoupon.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        // Coupon successfully applied - the validation should already be set
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to apply coupon';
      });
  },
});

export const { clearAppliedCoupon, clearError, setAppliedCoupon } = couponSlice.actions;
export default couponSlice.reducer;