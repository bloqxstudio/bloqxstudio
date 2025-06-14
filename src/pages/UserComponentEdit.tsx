
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getComponentById, getCategories } from '@/core/api';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import EditComponentForm from '@/components/forms/EditComponentForm';

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

const UserComponentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, navigate]);

  const { data: component, isLoading: isLoadingComponent } = useQuery({
    queryKey: ['component', id],
    queryFn: () => id ? getComponentById(id) : Promise.reject('ID não fornecido'),
    enabled: !!id && !!user,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching component:', error);
        toast.error('Erro ao carregar o componente');
        navigate('/components');
      }
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: !!user
  });

  // Check if user owns this component
  useEffect(() => {
    if (component && user && component.created_by !== user.id) {
      toast.error('Você não tem permissão para editar este componente');
      navigate('/components');
    }
  }, [component, user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/components">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para Componentes
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tighter">Editar Meu Componente</h1>
        <p className="text-muted-foreground mt-1">
          Atualize os detalhes do seu componente
        </p>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Componente</CardTitle>
        </CardHeader>
        <CardContent>
          {component && (
            <EditComponentForm component={component} />
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default UserComponentEdit;
