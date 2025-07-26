import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { flashSaleAPI } from '../../services/api';
import { FlashSale } from '../../types/FlashSale';

interface FlashSaleState {
  activeFlashSales: FlashSale[];
  upcomingFlashSales: FlashSale[];
  currentFlashSale: FlashSale | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FlashSaleState = {
  activeFlashSales: [],
  upcomingFlashSales: [],
  currentFlashSale: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchActiveFlashSales = createAsyncThunk(
  'flashSale/fetchActive',
  async () => {
    const response = await flashSaleAPI.getActiveFlashSales();
    return response.data;
  }
);

export const fetchUpcomingFlashSales = createAsyncThunk(
  'flashSale/fetchUpcoming',
  async () => {
    const response = await flashSaleAPI.getUpcomingFlashSales();
    return response.data;
  }
);

export const fetchFlashSale = createAsyncThunk(
  'flashSale/fetchSingle',
  async (id: string) => {
    const response = await flashSaleAPI.getFlashSale(id);
    return response.data;
  }
);

export const recordFlashSalePurchase = createAsyncThunk(
  'flashSale/recordPurchase',
  async ({ saleId, productId, quantity }: { saleId: string; productId: string; quantity: number }) => {
    const response = await flashSaleAPI.recordPurchase(saleId, productId, quantity);
    return { saleId, productId, quantity };
  }
);

const flashSaleSlice = createSlice({
  name: 'flashSale',
  initialState,
  reducers: {
    clearCurrentFlashSale: (state) => {
      state.currentFlashSale = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateFlashSaleStock: (state, action: PayloadAction<{ saleId: string; productId: string; quantity: number }>) => {
      const { saleId, productId, quantity } = action.payload;
      
      // Update active flash sales
      const activeFlashSale = state.activeFlashSales.find(sale => sale._id === saleId);
      if (activeFlashSale) {
        const product = activeFlashSale.products.find((p: any) => p._id === productId);
        if (product) {
          product.stock -= quantity;
          product.sold += quantity;
        }
      }
      
      // Update current flash sale if it matches
      if (state.currentFlashSale && state.currentFlashSale._id === saleId) {
        const product = state.currentFlashSale.products.find((p: any) => p._id === productId);
        if (product) {
          product.stock -= quantity;
          product.sold += quantity;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active flash sales
      .addCase(fetchActiveFlashSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveFlashSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeFlashSales = action.payload;
      })
      .addCase(fetchActiveFlashSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch active flash sales';
      })
      // Fetch upcoming flash sales
      .addCase(fetchUpcomingFlashSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingFlashSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingFlashSales = action.payload;
      })
      .addCase(fetchUpcomingFlashSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch upcoming flash sales';
      })
      // Fetch single flash sale
      .addCase(fetchFlashSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFlashSale.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFlashSale = action.payload;
      })
      .addCase(fetchFlashSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch flash sale';
      })
      // Record purchase
      .addCase(recordFlashSalePurchase.fulfilled, (state, action) => {
        const { saleId, productId, quantity } = action.payload;
        flashSaleSlice.caseReducers.updateFlashSaleStock(state, {
          type: 'flashSale/updateFlashSaleStock',
          payload: { saleId, productId, quantity }
        });
      });
  },
});

export const { clearCurrentFlashSale, clearError, updateFlashSaleStock } = flashSaleSlice.actions;
export default flashSaleSlice.reducer;