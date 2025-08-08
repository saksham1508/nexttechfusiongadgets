import { configureStore, combineReducers, Middleware } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createLogger } from 'redux-logger';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';
import paymentReducer from './slices/paymentSlice';
import chatReducer from './slices/chatSlice';
import deliveryReducer from './slices/deliverySlice';
import flashSaleReducer from './slices/flashSaleSlice';
import couponReducer from './slices/couponSlice';

// Six Sigma: Performance monitoring middleware
const performanceMiddleware: Middleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();
  const duration = endTime - startTime;

  // Log slow actions (>10ms) for optimization
  if (duration > 10) {
    console.warn(`Slow Redux action detected: ${action.type} took ${duration.toFixed(2)}ms`);
  }

  // Track action performance in development
  if (process.env.NODE_ENV === 'development') {
    const state = store.getState();
    const stateSize = JSON.stringify(state).length;
    
    if (stateSize > 1000000) { // 1MB
      console.warn(`Large Redux state detected: ${(stateSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  return result;
};

// Agile: Error tracking middleware
const errorTrackingMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Redux action error:', {
      action: action.type,
      error: error instanceof Error ? error.message : String(error),
      state: store.getState(),
      timestamp: new Date().toISOString()
    });
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: errorTrackingService.captureException(error, { action });
    }
    
    throw error;
  }
};

// Lean: Selective persistence configuration
const persistConfig = {
  key: 'root',
  storage,
  // Only persist essential data to reduce storage usage
  // Remove 'auth' from whitelist to prevent persistence conflicts with logout
  whitelist: ['cart', 'wishlist', 'delivery', 'categories'],
  // Blacklist sensitive or temporary data
  blacklist: ['chat', 'flashSales', 'payment', 'auth'],
  // Transform data before persisting
  transforms: []
};

// Six Sigma: Root reducer with error boundaries
const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  categories: categoryReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  orders: orderReducer,
  payment: paymentReducer,
  chat: chatReducer,
  delivery: deliveryReducer,
  flashSales: flashSaleReducer,
  coupons: couponReducer,
});

// Wrap root reducer with error handling
const errorHandlingReducer = (state: any, action: any) => {
  try {
    return rootReducer(state, action);
  } catch (error) {
    console.error('Reducer error:', error);
    
    // Return previous state on error to prevent app crash
    return state || {};
  }
};

const persistedReducer = persistReducer(persistConfig, errorHandlingReducer);

// Define RootState type before store creation to avoid circular reference
export type RootState = ReturnType<typeof rootReducer>;

// Six Sigma: Configure store with comprehensive middleware
const isDevelopment = process.env.NODE_ENV === 'development';

const middleware: Middleware[] = [
  performanceMiddleware,
  errorTrackingMiddleware,
];

// Add logger only in development
if (isDevelopment) {
  const logger = createLogger({
    collapsed: true,
    duration: true,
    timestamp: true,
    // Only log specific actions to reduce noise
    predicate: (_getState, action) => {
      const ignoredActions = [
        'persist/PERSIST',
        'persist/REHYDRATE',
        'chat/updateTyping',
        'products/updateSearchQuery'
      ];
      return !ignoredActions.includes(action.type);
    }
  });
  middleware.push(logger as any);
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure serializable check for redux-persist
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
      // Enable immutability check only in development
      immutableCheck: isDevelopment,
    }).concat(middleware),
  // Enable Redux DevTools only in development
  devTools: isDevelopment && {
    name: 'NextTechFusionGadgets',
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action: any) => {
      if (action.type.includes('auth') && action.payload?.password) {
        return {
          ...action,
          payload: { ...action.payload, password: '[REDACTED]' }
        };
      }
      return action;
    },
    stateSanitizer: (state: any) => ({
      ...state,
      // Sanitize sensitive data in state
      auth: state.auth ? {
        ...state.auth,
        token: state.auth.token ? '[REDACTED]' : null,
        refreshToken: state.auth.refreshToken ? '[REDACTED]' : null
      } : state.auth
    })
  },
  // Enhance store for better performance
  enhancers: (defaultEnhancers) => {
    if (isDevelopment) {
      // Add development enhancers
      return defaultEnhancers;
    }
    return defaultEnhancers;
  }
});

export const persistor = persistStore(store);

// Six Sigma: Store performance monitoring
if (isDevelopment) {
  let lastStateSize = 0;
  
  store.subscribe(() => {
    const state = store.getState();
    const stateSize = JSON.stringify(state).length;
    
    // Monitor state size growth
    if (stateSize > lastStateSize * 1.5 && lastStateSize > 0) {
      console.warn(`Redux state size increased significantly: ${(stateSize / 1024).toFixed(2)}KB`);
    }
    
    lastStateSize = stateSize;
  });
}

// Agile: Store health check
export const getStoreHealth = () => {
  const state = store.getState();
  const stateSize = JSON.stringify(state).length;
  
  return {
    stateSize: `${(stateSize / 1024).toFixed(2)}KB`,
    isHealthy: stateSize < 1024 * 1024, // Less than 1MB
    sliceCount: Object.keys(state).length,
    timestamp: new Date().toISOString()
  };
};

// Export AppDispatch type
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
