import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks authentication and role
 * before rendering child components
 */
export const ProtectedRoute = ({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role if required
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = user.profile?.role;

    if (!userRole || !roles.includes(userRole)) {
      // User doesn't have required role, redirect to appropriate dashboard
      if (userRole === 'owner') {
        return <Navigate to="/owner-dashboard" replace />;
      }
      if (userRole === 'baker') {
        return <Navigate to="/kitchen-display" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

