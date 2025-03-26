
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
import { PlusCircle, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getComponents } from '@/lib/api';
import { toast } from 'sonner';

const Components = () => {
  const [filter, setFilter] = useState('');
  const { user, isAdmin } = useAuth(); // Ensure we're checking isAdmin
  const navigate = useNavigate();
  
  // Fetch components from Supabase
  const { data: components = [], isLoading, error } = useQuery({
    queryKey: ['components'],
    queryFn: getComponents
  });

  // Show error if data fetching fails
  useEffect(() => {
    if (error) {
      console.error('Error fetching components:', error);
      toast.error('Erro ao carregar componentes. Tente novamente.');
    }
  }, [error]);
  
  // Handle create button click
  const handleCreateClick = () => {
    navigate('/components/new');
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
            {isAdmin && (
              <Button onClick={handleCreateClick} className="hover-lift" size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                Novo Componente
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
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
              {isAdmin && (
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
