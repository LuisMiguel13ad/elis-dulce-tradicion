import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
 * ErrorBoundary component to catch JavaScript errors anywhere in the child
 * component tree, log those errors, and display a fallback UI instead of
 * the component tree that crashed.
 * 
 * This prevents a single component error from taking down the entire app.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
          hasError: false,
          error: null,
          errorInfo: null,
    };

  public static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
      return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to console (in production, send to error reporting service)
      console.error('ErrorBoundary caught an error:', error);
        console.error('Error info:', errorInfo);

      this.setState({ errorInfo });

      // In production, you would send this to an error reporting service like Sentry
      // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  private handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
        window.location.href = '/';
  };

  public render() {
        if (this.state.hasError) {
                // Custom fallback UI if provided
          if (this.props.fallback) {
                    return this.props.fallback;
          }

          // Default fallback UI
          return (
                    <div className="min-h-screen flex items-center justify-center bg-background p-4">
                              <div className="max-w-md w-full text-center space-y-6">
                                          <div className="flex justify-center">
                                                        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                                                                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                                                        </div>div>
                                          </div>div>
                              
                                          <div className="space-y-2">
                                                        <h1 className="text-2xl font-bold text-foreground">
                                                                        Oops! Something went wrong
                                                        </h1>h1>
                                                        <p className="text-muted-foreground">
                                                                        We're sorry, but something unexpected happened. Please try refreshing
                                                                        the page or go back to the home page.
                                                        </p>p>
                                          </div>div>
                              
                                {/* Show error details in development */}
                                {import.meta.env.DEV && this.state.error && (
                                    <div className="mt-4 p-4 bg-muted rounded-lg text-left overflow-auto max-h-48">
                                                    <p className="text-sm font-mono text-red-600 dark:text-red-400">
                                                      {this.state.error.toString()}
                                                    </p>p>
                                      {this.state.errorInfo && (
                                                        <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                                                          {this.state.errorInfo.componentStack}
                                                        </pre>pre>
                                                    )}
                                    </div>div>
                                          )}
                              
                                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                        <Button
                                                                          onClick={this.handleRetry}
                                                                          variant="default"
                                                                          className="flex items-center gap-2"
                                                                        >
                                                                        <RefreshCw className="h-4 w-4" />
                                                                        Try Again
                                                        </Button>Button>
                                                        <Button
                                                                          onClick={this.handleGoHome}
                                                                          variant="outline"
                                                                          className="flex items-center gap-2"
                                                                        >
                                                                        <Home className="h-4 w-4" />
                                                                        Go to Home
                                                        </Button>Button>
                                          </div>div>
                              
                                          <p className="text-xs text-muted-foreground">
                                                        If this problem persists, please contact support at{' '}
                                                        <a 
                                                                          href="mailto:support@elisbakery.com" 
                                                          className="text-primary hover:underline"
                                                                        >
                                                                        support@elisbakery.com
                                                        </a>a>
                                          </p>p>
                              </div>div>
                    </div>div>
                  );
        }
    
        return this.props.children;
  }
}

export default ErrorBoundary;</div>
