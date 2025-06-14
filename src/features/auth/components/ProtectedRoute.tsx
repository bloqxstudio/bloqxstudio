
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Skeleton } from '@/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  ownerOnly?: boolean;
  ownerId?: string;
}

const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  ownerOnly = false, 
  ownerId 
}: ProtectedRouteProps) => {
  const { user, isLoading, isError, isAdmin } = useAuth();

  // Log authentication state for debugging
  console.log("Rota protegida - Usuário:", user?.email);
  console.log("Rota protegida - É admin:", isAdmin);
  console.log("Rota protegida - Admin apenas:", adminOnly);
  console.log("Rota protegida - Dono apenas:", ownerOnly, "ID do dono:", ownerId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-screen p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Carregando status de autenticação...</p>
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
          <h2 className="text-xl font-semibold text-red-600">Erro de Autenticação</h2>
          <p className="text-gray-600">
            Não foi possível verificar seu status de autenticação. Isso pode ser devido a problemas de rede ou uma sessão expirada.
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Tentar novamente
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
    console.log("Usuário não é admin, redirecionando para a página de componentes");
    return <Navigate to="/components" />;
  }

  if (ownerOnly && ownerId && user.id !== ownerId && !isAdmin) {
    console.log("Usuário não é o dono do componente nem admin, redirecionando");
    return <Navigate to="/components" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
