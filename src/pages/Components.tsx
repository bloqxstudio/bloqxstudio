
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ComponentCard from '@/components/ComponentCard';
import { useAuth } from '@/context/AuthContext';
import { 
  Button,
  Card,
  CardContent
} from '@/components/ui';
import { PlusCircle, Filter, Settings, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getComponents } from '@/lib/api';
import { toast } from 'sonner';

const Components = () => {
  const [filter, setFilter] = useState('');
  const { user, isAdmin } = useAuth(); // We need to check if user is admin
  const navigate = useNavigate();
  
  // Fetch components from Supabase with increased reliability
  const { data: components = [], isLoading, error, refetch } = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
    staleTime: 30 * 1000,  // 30 seconds
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000),
  });

  // Show error if data fetching fails
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar componentes:', error);
      toast.error('Erro ao carregar componentes. Tentando novamente...');
      
      // Auto retry after delay
      const timer = setTimeout(() => {
        refetch();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, refetch]);
  
  // Handle create button click
  const handleCreateClick = () => {
    navigate('/components/new');
  };

  // Retry button handler
  const handleRetry = () => {
    toast.info('Recarregando componentes...');
    refetch();
  };

  // Filter components based on search term
  const filteredComponents = components.filter(component => 
    component.title.toLowerCase().includes(filter.toLowerCase()) ||
    component.description?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Componentes</h1>
            <p className="text-muted-foreground mt-1">
              Explore e utilize componentes Elementor pré-construídos.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <Button onClick={handleCreateClick} className="hover-lift" size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                Novo Componente
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-1"
              >
                <Settings className="h-4 w-4" />
                Painel de Controle
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={handleRetry}>
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>
        
        <div className="relative mb-8">
          <input
            type="search"
            placeholder="Buscar componentes por título, descrição ou tags..."
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando componentes...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-dashed border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <Filter className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar componentes</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Ocorreu um problema ao buscar os componentes. Verifique sua conexão e tente novamente.
              </p>
              <Button onClick={handleRetry} variant="outline">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        ) : filteredComponents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredComponents.map((component) => (
              <ComponentCard key={component.id} component={component} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Filter className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum componente encontrado</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Não encontramos nenhum componente com os filtros aplicados. Tente ajustar sua busca ou criar um novo componente.
              </p>
              {user && (
                <Button onClick={handleCreateClick}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Criar Componente
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Components;
