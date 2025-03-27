
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CodeViewer from '@/components/CodeViewer';
import ComponentBreadcrumb from '@/components/ComponentBreadcrumb';
import { useAuth } from '@/context/AuthContext';
import { 
  Button, 
  Card,
  CardContent,
  Separator,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import { ArrowLeft, Calendar, Download, Eye, Pencil, Trash, User, Shield, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Component } from '@/lib/database.types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComponent } from '@/lib/api';

const ComponentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  // Use React Query to fetch the component data
  const { data: component, isLoading, error } = useQuery({
    queryKey: ['component', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching component:', error);
        throw error;
      }
      
      return data as Component;
    },
  });

  // Check if user is the owner of the component
  const isOwner = user && component ? user.id === component.created_by : false;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (componentId: string) => deleteComponent(componentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Componente excluído com sucesso!');
      navigate('/components');
    },
    onError: (error) => {
      console.error('Error deleting component:', error);
      toast.error('Erro ao excluir componente. Tente novamente.');
    }
  });

  const handleDelete = () => {
    if (id) {
      deleteMutation.mutate(id);
      setShowDeleteDialog(false);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow py-12 px-4 container mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Carregando componente...</h1>
            <p className="text-muted-foreground mb-6">
              Aguarde enquanto buscamos as informações do componente.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error || !component) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow py-12 px-4 container mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Componente não encontrado</h1>
            <p className="text-muted-foreground mb-6">
              O componente que você está procurando não existe ou foi removido.
            </p>
            <Button asChild>
              <Link to="/components">Voltar para componentes</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleEdit = () => {
    if (id) {
      if (isAdmin) {
        navigate(`/component/edit/${id}`);
      } else if (isOwner) {
        navigate(`/my-component/edit/${id}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className={`sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur transition-all duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="container py-3 flex justify-between items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/components" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            {(isAdmin || isOwner) && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEdit}
                  className="hidden sm:flex"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="hidden sm:flex text-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-grow py-8 px-4 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 animate-fade-up">
            <div>
              <ComponentBreadcrumb category={component.category} title={component.title} />
              <h1 className="text-3xl font-bold tracking-tighter mb-4">{component.title}</h1>
              
              <div className="rounded-lg overflow-hidden border bg-card shadow-sm mb-6">
                <img 
                  src={component.preview_image || '/placeholder.svg'} 
                  alt={component.title}
                  className="w-full object-contain bg-white"
                  style={{ maxHeight: '500px' }}
                />
              </div>
              
              <div className="flex flex-wrap gap-3 my-6">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Visualizar
                </Button>
                
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
                
                {component && (
                  <CodeViewer 
                    code={component.json_code || component.code}
                    fileName={`${component.id}.json`}
                    restricted={true}
                  />
                )}
              </div>
              
              {component.description && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Descrição</h2>
                    <p className="text-muted-foreground">{component.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6 animate-fade-up delay-200">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detalhes</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    Última atualização: {new Date(component.updated_at).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Tag className="h-4 w-4 mr-2" />
                    Licença: <span className="text-primary ml-1">Gratuito</span>
                  </div>
                  
                  {component.category && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Tag className="h-4 w-4 mr-2" />
                      Categoria: <span className="ml-1">{component.category}</span>
                    </div>
                  )}
                  
                  {component.tags && component.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {component.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-muted rounded-full px-2.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ajuda</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Precisa de assistência com este componente? Nossa equipe está pronta para ajudar.
                </p>
                <Button className="w-full" variant="outline" asChild>
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                    Fale com a Bloqx Studio
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            {(isAdmin || isOwner) && (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ações de administrador</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Status:</p>
                    <div className="flex items-center gap-1 mt-1">
                      {isOwner ? (
                        <span className="flex items-center text-primary text-sm">
                          <User className="h-4 w-4 mr-1" />
                          Você é o proprietário
                        </span>
                      ) : isAdmin ? (
                        <span className="flex items-center text-amber-500 text-sm">
                          <Shield className="h-4 w-4 mr-1" />
                          Acesso administrativo
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={handleEdit}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar componente
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-destructive hover:bg-destructive/10"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir componente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </main>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Componente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este componente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default ComponentDetail;
