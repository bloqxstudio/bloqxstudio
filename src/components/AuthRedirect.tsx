
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Skeleton } from '@/components/ui/skeleton';

const AuthRedirect = () => {
  const { user, isLoading, isError } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-screen p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Verificando autenticação...</p>
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  // Se houver erro, redireciona para login
  if (isError) {
    return <Navigate to="/login" replace />;
  }

  // Se usuário estiver logado, vai para /components
  if (user) {
    return <Navigate to="/components" replace />;
  }

  // Se não estiver logado, vai para /login
  return <Navigate to="/login" replace />;
};

export default AuthRedirect;
