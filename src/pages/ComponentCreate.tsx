
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';
import ComponentCreateForm from '@/components/forms/ComponentCreateForm';
import JsonTransformer from '@/components/forms/JsonTransformer';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

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

const ComponentCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/components');
  };

  // Only render the form if user is logged in
  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Ferramenta para Componentes</h1>
          <p className="text-muted-foreground mt-1">
            Componentes curados pelo nosso time
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      </div>
      
      <Tabs defaultValue="create" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="create">Criar Componente</TabsTrigger>
          <TabsTrigger value="transform">Transformar JSON</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <ComponentCreateForm />
        </TabsContent>
        
        <TabsContent value="transform">
          <JsonTransformer />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
};

export default ComponentCreate;
