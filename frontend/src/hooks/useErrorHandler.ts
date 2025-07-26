// Agile: Comprehensive error handling hook with Six Sigma principles
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ErrorDetails {
  type: string;
  message: string;
  statusCode?: number;
  timestamp?: string;
  correlationId?: string;
  shouldRetry?: boolean;
  details?: any;
}

interface ErrorState {
  hasError: boolean;
  error: ErrorDetails | null;
  isRetrying: boolean;
  retryCount: number;
}

interface UseErrorHandlerReturn {
  error: ErrorState;
  handleError: (error: any) => void;
  clearError: () => void;
  retry: (retryFunction: () => Promise<any>) => Promise<void>;
  isRecoverable: boolean;
}

// Six Sigma: Define - Error categorization and handling strategies
const ERROR_CATEGORIES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  SERVER: 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  TIMEOUT: 'REQUEST_TIMEOUT'
} as const;

const RECOVERABLE_ERRORS = [
  ERROR_CATEGORIES.NETWORK,
  ERROR_CATEGORIES.RATE_LIMIT,
  ERROR_CATEGORIES.TIMEOUT,
  ERROR_CATEGORIES.SERVER
];

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  // Six Sigma: Analyze - Parse and categorize errors
  const parseError = useCallback((error: any): ErrorDetails => {
    // Handle API response errors
    if (error.response?.data?.error) {
      return {
        type: error.response.data.error.type || ERROR_CATEGORIES.SERVER,
        message: error.response.data.error.message || 'An error occurred',
        statusCode: error.response.status,
        timestamp: error.response.data.error.timestamp,
        correlationId: error.response.data.error.correlationId,
        shouldRetry: error.response.data.error.shouldRetry,
        details: error.response.data.error.details
      };
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return {
        type: ERROR_CATEGORIES.NETWORK,
        message: 'Network connection failed. Please check your internet connection.',
        shouldRetry: true
      };
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        type: ERROR_CATEGORIES.TIMEOUT,
        message: 'Request timed out. Please try again.',
        shouldRetry: true
      };
    }

    // Handle HTTP status codes
    if (error.response?.status) {
      const status = error.response.status;
      
      if (status === 401) {
        return {
          type: ERROR_CATEGORIES.AUTHENTICATION,
          message: 'Please log in to continue.',
          statusCode: status,
          shouldRetry: false
        };
      }
      
      if (status === 403) {
        return {
          type: ERROR_CATEGORIES.AUTHORIZATION,
          message: 'You do not have permission to perform this action.',
          statusCode: status,
          shouldRetry: false
        };
      }
      
      if (status === 404) {
        return {
          type: ERROR_CATEGORIES.NOT_FOUND,
          message: 'The requested resource was not found.',
          statusCode: status,
          shouldRetry: false
        };
      }
      
      if (status === 429) {
        return {
          type: ERROR_CATEGORIES.RATE_LIMIT,
          message: 'Too many requests. Please wait before trying again.',
          statusCode: status,
          shouldRetry: true
        };
      }
      
      if (status >= 500) {
        return {
          type: ERROR_CATEGORIES.SERVER,
          message: 'Server error occurred. Please try again later.',
          statusCode: status,
          shouldRetry: true
        };
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return {
        type: ERROR_CATEGORIES.VALIDATION,
        message: error.message || 'Invalid input data',
        shouldRetry: false,
        details: error.details
      };
    }

    // Default error
    return {
      type: ERROR_CATEGORIES.SERVER,
      message: error.message || 'An unexpected error occurred',
      shouldRetry: false
    };
  }, []);

  // Agile: Handle errors with appropriate user feedback
  const handleError = useCallback((error: any) => {
    const parsedError = parseError(error);
    
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      error: parsedError,
      isRetrying: false
    }));

    // Six Sigma: Control - Provide appropriate user feedback
    switch (parsedError.type) {
      case ERROR_CATEGORIES.NETWORK:
        toast.error('Connection failed. Please check your internet connection.', {
          id: 'network-error',
          duration: 5000
        });
        break;
        
      case ERROR_CATEGORIES.AUTHENTICATION:
        toast.error('Please log in to continue.', {
          id: 'auth-error',
          duration: 4000
        });
        // Could trigger redirect to login page
        break;
        
      case ERROR_CATEGORIES.AUTHORIZATION:
        toast.error('Access denied. You do not have permission for this action.', {
          id: 'auth-error',
          duration: 4000
        });
        break;
        
      case ERROR_CATEGORIES.VALIDATION:
        if (parsedError.details && Array.isArray(parsedError.details)) {
          parsedError.details.forEach((detail: any) => {
            toast.error(`${detail.field}: ${detail.message}`, {
              duration: 4000
            });
          });
        } else {
          toast.error(parsedError.message, {
            duration: 4000
          });
        }
        break;
        
      case ERROR_CATEGORIES.RATE_LIMIT:
        toast.error('Too many requests. Please wait before trying again.', {
          id: 'rate-limit-error',
          duration: 6000
        });
        break;
        
      case ERROR_CATEGORIES.NOT_FOUND:
        toast.error('Resource not found.', {
          duration: 3000
        });
        break;
        
      default:
        toast.error(parsedError.message, {
          duration: 4000
        });
    }

    // Log error for monitoring (in production, send to error tracking service)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', {
        originalError: error,
        parsedError,
        timestamp: new Date().toISOString()
      });
    }
  }, [parseError]);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      isRetrying: false,
      retryCount: 0
    });
  }, []);

  // Lean: Intelligent retry mechanism with exponential backoff
  const retry = useCallback(async (retryFunction: () => Promise<any>) => {
    if (!errorState.error?.shouldRetry || errorState.retryCount >= MAX_RETRY_ATTEMPTS) {
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    // Wait before retrying (exponential backoff)
    const delay = RETRY_DELAYS[errorState.retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const result = await retryFunction();
      
      // Success - clear error state
      setErrorState({
        hasError: false,
        error: null,
        isRetrying: false,
        retryCount: 0
      });
      
      toast.success('Operation completed successfully!', {
        duration: 3000
      });
      
      return result;
    } catch (retryError) {
      setErrorState(prev => ({
        ...prev,
        isRetrying: false
      }));
      
      // If max retries reached, show final error
      if (errorState.retryCount + 1 >= MAX_RETRY_ATTEMPTS) {
        toast.error('Maximum retry attempts reached. Please try again later.', {
          duration: 5000
        });
      } else {
        handleError(retryError);
      }
    }
  }, [errorState.error, errorState.retryCount, handleError]);

  // Check if error is recoverable
  const isRecoverable = errorState.error ? 
    RECOVERABLE_ERRORS.includes(errorState.error.type as any) && 
    errorState.retryCount < MAX_RETRY_ATTEMPTS : 
    false;

  return {
    error: errorState,
    handleError,
    clearError,
    retry,
    isRecoverable
  };
};