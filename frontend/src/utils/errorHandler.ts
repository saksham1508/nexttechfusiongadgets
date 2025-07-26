// Error handling utilities
export interface ApiError {
  status?: number;
  message: string;
  type?: string;
  details?: any;
}

export const handleApiError = (error: any): string => {
  // Handle network errors
  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }

  const status = error.response.status;
  const data = error.response.data;

  // Handle specific status codes
  switch (status) {
    case 400:
      return data?.message || data?.error?.message || 'Invalid request. Please check your input.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return data?.message || data?.error?.message || 'This resource already exists.';
    case 422:
      return data?.message || data?.error?.message || 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return data?.message || data?.error?.message || 'An unexpected error occurred.';
  }
};

export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.code === 'NETWORK_ERROR';
};

export const shouldRetry = (error: any): boolean => {
  const status = error.response?.status;
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
};

// Suppress Chrome extension errors
export const suppressChromeExtensionErrors = () => {
  if (typeof window === 'undefined') return;
  
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('runtime.lastError') || 
        message.includes('message channel closed') ||
        message.includes('Extension context invalidated') ||
        message.includes('listener indicated an asynchronous response')) {
      // Suppress Chrome extension errors
      return;
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('runtime.lastError') || 
        message.includes('message channel closed') ||
        message.includes('Extension context invalidated')) {
      // Suppress Chrome extension warnings
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
};