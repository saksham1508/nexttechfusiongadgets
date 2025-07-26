import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Wishlist, WishlistItem } from '../../types';
import api from '../../services/api';

interface WishlistState {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async () => {
    const response = await api.get('/wishlist');
    return response.data;
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({ productId, notifyOnPriceChange = false, notifyOnStock = false }: {
    productId: string;
    notifyOnPriceChange?: boolean;
    notifyOnStock?: boolean;
  }) => {
    const response = await api.post('/wishlist/items', {
      productId,
      notifyOnPriceChange,
      notifyOnStock
    });
    return response.data;
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string) => {
    await api.delete(`/wishlist/items/${productId}`);
    return productId;
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async () => {
    await api.delete('/wishlist');
    return null;
  }
);

export const moveToCart = createAsyncThunk(
  'wishlist/moveToCart',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
    await api.post(`/wishlist/move-to-cart/${productId}`, { quantity });
    return productId;
  }
);

export const updateWishlistSettings = createAsyncThunk(
  'wishlist/updateSettings',
  async (settings: { name?: string; description?: string; isPublic?: boolean }) => {
    const response = await api.put('/wishlist/settings', settings);
    return response.data;
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    toggleWishlistItem: (state, action) => {
      if (state.wishlist) {
        const productId = action.payload;
        const existingItemIndex = state.wishlist.items.findIndex(
          item => item.product._id === productId
        );
        
        if (existingItemIndex > -1) {
          state.wishlist.items.splice(existingItemIndex, 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload.data;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wishlist';
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload.data;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add to wishlist';
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        if (state.wishlist) {
          state.wishlist.items = state.wishlist.items.filter(
            item => item.product._id !== action.payload
          );
        }
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove from wishlist';
      })
      
      // Clear wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false;
        if (state.wishlist) {
          state.wishlist.items = [];
        }
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to clear wishlist';
      })
      
      // Move to cart
      .addCase(moveToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.loading = false;
        if (state.wishlist) {
          state.wishlist.items = state.wishlist.items.filter(
            item => item.product._id !== action.payload
          );
        }
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to move to cart';
      })
      
      // Update settings
      .addCase(updateWishlistSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWishlistSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload.data;
      })
      .addCase(updateWishlistSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update wishlist settings';
      });
  },
});

export const { clearError, toggleWishlistItem } = wishlistSlice.actions;

// Export alias for backward compatibility
export const toggleWishlist = toggleWishlistItem;

export default wishlistSlice.reducer;