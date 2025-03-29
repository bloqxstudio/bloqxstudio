
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getComponentById, getCategories } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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

const ComponentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Acesso restrito apenas para administradores');
      navigate('/components');
    }
  }, [isAdmin, navigate]);

  const { data: component, isLoading: isLoadingComponent } = useQuery({
    queryKey: ['component', id],
    queryFn: () => id ? getComponentById(id) : Promise.reject('ID não fornecido'),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching component:', error);
        toast.error('Erro ao carregar o componente');
        navigate('/admin');
      }
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  useEffect(() => {
    if (component) {
      setIsLoading(false);
    }
  }, [component]);

  useEffect(() => {
    const handleError = (error: any) => {
      console.error('Error fetching component:', error);
      toast.error('Erro ao carregar o componente');
      navigate('/admin');
    };

    if (component === undefined && !isLoadingComponent) {
      handleError(new Error('Component not found'));
    }
  }, [component, isLoadingComponent, navigate]);

  return (
    <PageWrapper>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para o Painel
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tighter">Editar Componente</h1>
        <p className="text-muted-foreground mt-1">
          Atualize os detalhes do componente
        </p>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Componente</CardTitle>
        </CardHeader>
        <CardContent>
          <EditComponentForm
            id={id || ''}
            component={component}
            categories={categories}
            isLoading={isLoading || isLoadingComponent}
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default ComponentEdit;
