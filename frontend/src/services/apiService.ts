// Enhanced API Service with Error Handling and TypeScript Support
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isNetworkError?: boolean;
}

interface HealthCheckResponse {
  isHealthy: boolean;
  message: string;
  status: 'success' | 'warning' | 'error' | 'loading';
  suggestion?: string;
}

class ApiService {
  private baseURL: string;
  private isOnline: boolean = true;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  // Check if API is available
  async checkApiStatus(): Promise<{ status: string; message: string; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.isOnline = true;
        return { status: 'online', message: 'API is available' };
      } else {
        this.isOnline = false;
        return { status: 'error', message: `API returned status: ${response.status}` };
      }
    } catch (error) {
      this.isOnline = false;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { status: 'timeout', message: 'API request timed out' };
        }
        
        return { 
          status: 'offline', 
          message: 'Backend server is not running. Please start the backend server.',
          error: error.message 
        };
      }
      
      return { 
        status: 'offline', 
        message: 'Unknown error occurred',
        error: 'Unknown error'
      };
    }
  }

  // Generic API request with retry logic
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Read token similar to axios interceptor
    let token: string | null = localStorage.getItem('token');
    if (!token) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          const userObj = parsed.user || parsed; // support wrapped or direct shapes
          if (userObj?.token) token = userObj.token;
          // Dev fallback: generate mock vendor token if seller (keeps parity with axios path)
          if (!token && userObj?.role === 'seller') {
            const vendorId = userObj._id || 'vendor_1';
            token = `mock_vendor_token_${vendorId}`;
            localStorage.setItem('token', token);
          }
        }
      } catch {}
    }

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    // Merge headers carefully so caller-supplied headers can override defaults if needed
    const requestOptions: RequestInit = {
      ...options,
      headers: { ...(defaultOptions.headers || {}), ...(options.headers || {}) },
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.isOnline = true;
        return { success: true, data };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`API request attempt ${attempt} failed:`, errorMessage);
        
        if (attempt === this.retryAttempts) {
          this.isOnline = false;
          return {
            success: false,
            error: errorMessage,
            isNetworkError: error instanceof Error && error.name === 'TypeError' && errorMessage.includes('fetch')
          };
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      error: 'Maximum retry attempts exceeded'
    };
  }

  // Specific API methods
  async getProducts(): Promise<ApiResponse> {
    return this.request('/products');
  }

  async getUsers(): Promise<ApiResponse> {
    return this.request('/users');
  }

  async getOrders(): Promise<ApiResponse> {
    return this.request('/orders');
  }

  async getPaymentMethods(): Promise<ApiResponse> {
    return this.request('/payment-methods');
  }

  // Health check with user-friendly messages
  async healthCheck(): Promise<HealthCheckResponse> {
    const result = await this.checkApiStatus();
    
    switch (result.status) {
      case 'online':
        return { 
          isHealthy: true, 
          message: '✅ Backend server is running normally',
          status: 'success'
        };
      case 'timeout':
        return { 
          isHealthy: false, 
          message: '⏱️ Backend server is slow to respond',
          status: 'warning',
          suggestion: 'The server might be overloaded. Please wait a moment and try again.'
        };
      case 'offline':
        return { 
          isHealthy: false, 
          message: '❌ Backend server is not running',
          status: 'error',
          suggestion: 'Please start the backend server by running "npm run dev" in the backend directory.'
        };
      default:
        return { 
          isHealthy: false, 
          message: '⚠️ Backend server returned an error',
          status: 'error',
          suggestion: 'Please check the backend server logs for more information.'
        };
    }
  }

  // Get connection status
  get connectionStatus(): boolean {
    return this.isOnline;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export type { ApiResponse, HealthCheckResponse };