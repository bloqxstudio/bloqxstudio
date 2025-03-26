
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, isLoading, isError, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-screen p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading authentication status...</p>
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 bg-red-50">
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
          <p className="text-gray-600">
            We couldn't verify your authentication status. This could be due to network issues or an expired session.
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/components" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
