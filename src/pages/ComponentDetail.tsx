
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CodeViewer from '@/components/CodeViewer';
import { useAuth } from '@/context/AuthContext';
import { 
  Button, 
  Badge,
  Separator,
  Card,
  CardContent,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import { ArrowLeft, Calendar, Copy, Download, Tag, Lock, Pencil, Trash } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyCode = () => {
    if (!user) {
      toast.error('Faça login para copiar o código');
      return;
    }
    
    if (component) {
      // Use json_code if available, otherwise fall back to code
      const codeToCopy = component.json_code || component.code;
      navigator.clipboard.writeText(codeToCopy);
      toast.success('Código copiado para a área de transferência!');
    }
  };

  const handleDownloadCode = () => {
    if (!user) {
      toast.error('Faça login para baixar o código');
      return;
    }
    
    if (component) {
      const element = document.createElement('a');
      // Use json_code if available, otherwise fall back to code
      const codeToCopy = component.json_code || component.code;
      const file = new Blob([codeToCopy], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `${component.id}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Arquivo ${component.id}.json baixado com sucesso!`);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/component/edit/${id}`);
    }
  };

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
            {isAdmin && (
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
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={handleDownloadCode}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Baixar
                </Button>
                <Button 
                  onClick={handleCopyCode}
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar Código
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/login">
                    Entrar
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">
                    Criar conta
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-grow py-8 px-4 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 animate-fade-up">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">{component.title}</h1>
              <p className="text-muted-foreground mt-2">{component.description}</p>
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Criado em: {new Date(component.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Atualizado em: {new Date(component.updated_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {component.tags && component.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Visualização</h2>
              <div className="rounded-lg overflow-hidden border bg-muted/20">
                <img 
                  src={component.preview_image || '/placeholder.svg'} 
                  alt={component.title}
                  className="w-full max-h-[400px] object-contain"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Código Elementor</h2>
              <CodeViewer 
                code={component.json_code || component.code}
                title="Código JSON para Elementor"
                fileName={`${component.id}.json`}
                restricted={!user}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6 animate-fade-up delay-200">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Instruções de Uso</h3>
                <ol className="space-y-4 text-sm">
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      1
                    </div>
                    <div>
                      <p><strong>Copie o código JSON</strong> clicando no botão "Copiar Código" acima.</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      2
                    </div>
                    <div>
                      <p><strong>Abra o Elementor</strong> na página onde deseja usar este componente.</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      3
                    </div>
                    <div>
                      <p>Clique no ícone de <strong>hambúrguer</strong> (três linhas) no canto superior esquerdo do painel do Elementor.</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      4
                    </div>
                    <div>
                      <p>Selecione <strong>"Copiar de outro site"</strong> no menu.</p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      5
                    </div>
                    <div>
                      <p><strong>Cole o código JSON</strong> na caixa de texto e clique em "Importar".</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Informações Adicionais</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Tipo de componente:</p>
                    <p className="text-muted-foreground">{component.type || 'elementor'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Categoria:</p>
                    <p className="text-muted-foreground">
                      {component.category}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">ID:</p>
                    <p className="text-muted-foreground">{component.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="p-4 rounded-lg bg-muted/30 relative overflow-hidden">
              <h3 className="text-sm font-medium mb-2">Ações rápidas</h3>
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <>
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
                  </>
                )}
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar código JSON
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start"
                      onClick={handleDownloadCode}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar arquivo JSON
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="opacity-60 pointer-events-none filter blur-[0.5px]">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="justify-start w-full"
                          disabled
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar código JSON
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="justify-start w-full mt-2"
                          disabled
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar arquivo JSON
                        </Button>
                      </div>
                      
                      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex flex-col justify-center p-4">
                        <div className="text-center">
                          <Lock className="h-6 w-6 mx-auto mb-3 text-primary" />
                          <p className="text-sm font-medium mb-3">Faça login para acessar</p>
                          <div className="flex gap-2 justify-center">
                            <Button asChild size="sm" variant="outline">
                              <Link to="/login">Entrar</Link>
                            </Button>
                            <Button asChild size="sm">
                              <Link to="/register">Registrar</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
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
