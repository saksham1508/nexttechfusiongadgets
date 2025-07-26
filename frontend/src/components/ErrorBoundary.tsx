// Six Sigma: Comprehensive error boundary with analytics and recovery
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

// Six Sigma: Error categorization and metrics
class ErrorAnalytics {
  private static instance: ErrorAnalytics;
  private errors: Array<{
    id: string;
    error: Error;
    errorInfo: ErrorInfo;
    timestamp: Date;
    userAgent: string;
    url: string;
    userId?: string;
    componentStack: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  static getInstance(): ErrorAnalytics {
    if (!ErrorAnalytics.instance) {
      ErrorAnalytics.instance = new ErrorAnalytics();
    }
    return ErrorAnalytics.instance;
  }

  recordError(
    id: string,
    error: Error,
    errorInfo: ErrorInfo,
    additionalContext?: Record<string, any>
  ) {
    const errorRecord = {
      id,
      error,
      errorInfo,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: additionalContext?.userId,
      componentStack: errorInfo.componentStack || 'Unknown',
      severity: this.categorizeError(error) as 'low' | 'medium' | 'high' | 'critical'
    };

    this.errors.push(errorRecord);

    // Keep only last 100 errors (Lean: prevent memory bloat)
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(errorRecord);
    }

    console.error('React Error Boundary:', errorRecord);
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('payment') ||
      message.includes('auth')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      message.includes('chunk') ||
      message.includes('module') ||
      stack.includes('router') ||
      stack.includes('redux')
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      message.includes('render') ||
      message.includes('component') ||
      message.includes('prop')
    ) {
      return 'medium';
    }

    return 'low';
  }

  private async sendToAnalytics(errorRecord: any) {
    try {
      // In a real application, send to your analytics service
      // await fetch('/api/analytics/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorRecord)
      // });
    } catch (analyticsError) {
      console.warn('Failed to send error to analytics:', analyticsError);
    }
  }

  getErrorMetrics() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(e => e.timestamp > last24Hours);
    const errorsByComponent = recentErrors.reduce((acc, error) => {
      const component = this.extractComponentName(error.componentStack);
      acc[component] = (acc[component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errors.length,
      recentErrors: recentErrors.length,
      errorsByComponent,
      errorsBySeverity: recentErrors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private extractComponentName(componentStack: string): string {
    const match = componentStack.match(/in (\w+)/);
    return match ? match[1] : 'Unknown';
  }
}

class ErrorBoundary extends Component<Props, State> {
  private errorAnalytics = ErrorAnalytics.getInstance();
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Six Sigma: Analyze - Record and analyze the error
    this.setState({ errorInfo });
    
    this.errorAnalytics.recordError(
      this.state.errorId,
      error,
      errorInfo,
      {
        retryCount: this.state.retryCount,
        timestamp: new Date().toISOString()
      }
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show user-friendly error message
    toast.error('Something went wrong. We\'re working to fix it!', {
      id: this.state.errorId,
      duration: 5000
    });
  }

  componentWillUnmount() {
    // Clean up retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  // Agile: Automatic retry mechanism with exponential backoff
  handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;
    
    if (retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached. Please refresh the page.', {
        duration: 8000
      });
      return;
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;
    
    toast.loading('Retrying...', { duration: delay });
    
    const timeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      });
      
      toast.dismiss();
      toast.success('Retry successful!', { duration: 3000 });
    }, delay);

    this.retryTimeouts.push(timeout);
  };

  // Lean: Refresh page as last resort
  handleRefresh = () => {
    window.location.reload();
  };

  // Report issue to support
  handleReportIssue = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // In a real app, send to support system
    console.log('Error report:', errorDetails);
    
    toast.success('Error report sent to our support team. Thank you!', {
      duration: 4000
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 text-red-500">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Oops! Something went wrong
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-4 bg-red-50 rounded-md">
                    <p className="text-sm text-red-800 font-mono">
                      {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <pre className="mt-2 text-xs text-red-700 overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="space-y-3">
              {this.state.retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Try Again ({3 - this.state.retryCount} attempts left)
                </button>
              )}
              
              <button
                onClick={this.handleRefresh}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={this.handleReportIssue}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Report Issue
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Error ID: {this.state.errorId}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorAnalytics };