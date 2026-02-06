import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({ errorInfo });

    // Send to Sentry error tracking
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleRetry = () => {
    // Clear the error state and try again
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    // Full page reload
    window.location.reload();
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white p-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified and we're working on it.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="bg-amber-600 hover:bg-amber-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Show error details in development mode */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 text-left">
                <details className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <summary className="cursor-pointer text-sm font-medium text-red-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack && (
                      <>
                        {'\n\nComponent Stack:'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              </div>
            )}

            <p className="mt-8 text-sm text-gray-500">
              If the problem persists, please contact us at{' '}
              <a
                href="mailto:support@elisbakery.com"
                className="text-amber-600 hover:underline"
              >
                support@elisbakery.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
