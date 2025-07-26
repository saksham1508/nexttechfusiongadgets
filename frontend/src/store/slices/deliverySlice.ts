import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { deliveryAPI } from '../../services/api';
import { DeliveryZone, Location } from '../../types';

interface DeliveryState {
  zones: DeliveryZone[];
  selectedLocation: Location | null;
  availableSlots: any[];
  deliveryInfo: {
    available: boolean;
    estimatedTime: number | null;
    deliveryFee: number;
    freeDeliveryThreshold: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DeliveryState = {
  zones: [],
  selectedLocation: null,
  availableSlots: [],
  deliveryInfo: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const checkDeliveryAvailability = createAsyncThunk(
  'delivery/checkAvailability',
  async (coordinates: { lat: number; lng: number }) => {
    const response = await deliveryAPI.checkAvailability(coordinates);
    return response.data;
  }
);

export const fetchDeliverySlots = createAsyncThunk(
  'delivery/fetchSlots',
  async (addressId?: string) => {
    const response = await deliveryAPI.getDeliverySlots(addressId);
    return response.data;
  }
);

export const fetchDeliveryZones = createAsyncThunk(
  'delivery/fetchZones',
  async () => {
    const response = await deliveryAPI.getDeliveryZones();
    return response.data;
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<Location | null>) => {
      state.selectedLocation = action.payload;
    },
    clearDeliveryInfo: (state) => {
      state.deliveryInfo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check delivery availability
      .addCase(checkDeliveryAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkDeliveryAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveryInfo = action.payload;
      })
      .addCase(checkDeliveryAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to check delivery availability';
      })
      // Fetch delivery slots
      .addCase(fetchDeliverySlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliverySlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchDeliverySlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch delivery slots';
      })
      // Fetch delivery zones
      .addCase(fetchDeliveryZones.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryZones.fulfilled, (state, action) => {
        state.isLoading = false;
        state.zones = action.payload;
      })
      .addCase(fetchDeliveryZones.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch delivery zones';
      });
  },
});

export const { setSelectedLocation, clearDeliveryInfo, clearError } = deliverySlice.actions;
export default deliverySlice.reducer;