
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';
import ComponentCreateForm from '@/components/forms/ComponentCreateForm';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const ComponentCreate = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth(); // Make sure we get both user and isAdmin
  
  // Check if user is logged in and is an admin
  useEffect(() => {
    if (!user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
      return;
    }
    
    // Redirect non-admin users
    if (!isAdmin) {
      toast.error('Apenas administradores podem criar componentes');
      navigate('/components');
    }
  }, [user, isAdmin, navigate]);

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/components');
  };

  // Only render the form if user is logged in and is an admin
  if (!user || !isAdmin) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Criar novo componente</h1>
            <p className="text-muted-foreground mt-1">
              Apenas o título e o código JSON são obrigatórios
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        </div>
        
        <ComponentCreateForm />
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default ComponentCreate;
