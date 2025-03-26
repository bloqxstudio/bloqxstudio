
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CodeViewer from '@/components/CodeViewer';
import { getSampleComponentById } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { 
  Button, 
  Badge,
  Separator,
  Card,
  CardContent
} from '@/components/ui';
import { ArrowLeft, Calendar, Copy, Download, Tag, Lock } from 'lucide-react';
import { toast } from 'sonner';

const ComponentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState(getSampleComponentById(id || ''));
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      const componentData = getSampleComponentById(id);
      setComponent(componentData);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const handleCopyCode = () => {
    if (!user) {
      toast.error('Faça login para copiar o código');
      return;
    }
    
    if (component) {
      navigator.clipboard.writeText(component.jsonCode);
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
      const file = new Blob([component.jsonCode], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `${component.id}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Arquivo ${component.id}.json baixado com sucesso!`);
    }
  };

  if (!component) {
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
            {user && (
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
            )}
            
            {!user && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Faça login para acessar</span>
                <Lock className="h-4 w-4 text-muted-foreground" />
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
                  Criado em: {new Date(component.dateCreated).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Atualizado em: {new Date(component.dateUpdated).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {component.tags.map((tag, i) => (
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
                  src={component.previewImage || '/placeholder.svg'} 
                  alt={component.title}
                  className="w-full max-h-[400px] object-contain"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Código Elementor</h2>
              
              {!user ? (
                <div className="relative">
                  <div className="rounded-lg overflow-hidden border border-border bg-card">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                      <h3 className="text-sm font-medium">Código JSON para Elementor</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs opacity-50 cursor-not-allowed"
                          disabled
                        >
                          <Lock className="h-3.5 w-3.5 mr-1" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-auto max-h-[200px] bg-card">
                      <pre className="text-sm p-4 code-json">
                        {/* Show first few lines of code */}
                        {component.jsonCode.split('\n').slice(0, 5).join('\n')}
                        {'\n...'}
                      </pre>
                      
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/95 flex flex-col items-center justify-end p-6">
                        <div className="bg-card/90 backdrop-blur-sm p-6 rounded-lg text-center max-w-md">
                          <Lock className="h-8 w-8 mx-auto mb-4 text-primary" />
                          <h3 className="text-lg font-bold mb-2">Acesso exclusivo para membros</h3>
                          <p className="text-muted-foreground mb-4">
                            Crie sua conta gratuita para acessar este componente e muitos outros.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild variant="outline">
                              <Link to="/login">Entrar</Link>
                            </Button>
                            <Button asChild>
                              <Link to="/register">Criar conta</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <CodeViewer 
                  code={component.jsonCode}
                  title="Código JSON para Elementor"
                  fileName={`${component.id}.json`}
                />
              )}
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
                    <p className="text-muted-foreground">{component.type}</p>
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
            
            <div className="p-4 rounded-lg bg-muted/30">
              <h3 className="text-sm font-medium mb-2">Ações rápidas</h3>
              <div className="flex flex-col gap-2">
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
                  <div className="text-center p-2">
                    <p className="text-sm text-muted-foreground mb-2">Faça login para acessar todas as ações</p>
                    <div className="flex gap-2 justify-center">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/login">Entrar</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/register">Registrar</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default ComponentDetail;
