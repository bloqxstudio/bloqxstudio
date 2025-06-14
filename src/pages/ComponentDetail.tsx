
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { getComponent } from '@/core/api';
import { Component } from '@/core/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  Edit, 
  Eye, 
  EyeOff, 
  Calendar,
  User,
  Tag,
  Lock,
  Globe,
  ExternalLink
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CodeViewer from '@/components/CodeViewer';
import { getStandardTransformedJson } from '@/utils/json';

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

const ComponentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [showCode, setShowCode] = useState(false);

  const { data: component, isLoading, error } = useQuery({
    queryKey: ['component', id],
    queryFn: () => getComponent(id || ''),
    enabled: !!id,
  });

  useEffect(() => {
    if (!user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleCopyCode = () => {
    if (!component) return;
    
    try {
      // Use json_code if available, otherwise fall back to code
      const sourceJson = component.json_code || component.code || '[]';
      console.log('ComponentDetail copying from component:', sourceJson);
      
      // Apply the EXACT same transformation as other copy buttons
      const elementorStandardJson = getStandardTransformedJson(sourceJson);
      console.log('ComponentDetail transformed JSON:', elementorStandardJson);

      navigator.clipboard.writeText(elementorStandardJson);
      toast.success('JSON Elementor padrão copiado! Perfeito para colar no Elementor.');
    } catch (error) {
      console.error('Error copying and transforming JSON:', error);
      
      // Fallback: copy original code
      try {
        const fallbackCode = component.json_code || component.code;
        navigator.clipboard.writeText(fallbackCode);
        toast.success('Código original copiado para a área de transferência!');
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        toast.error('Erro ao copiar código');
      }
    }
  };

  const handleDownload = () => {
    if (!component) return;
    
    try {
      // Use the same transformation logic for download
      const sourceJson = component.json_code || component.code || '[]';
      const elementorStandardJson = getStandardTransformedJson(sourceJson);
      
      const filename = `${component.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      const blob = new Blob([elementorStandardJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename} Elementor padrão baixado com sucesso`);
    } catch (error) {
      console.error('Error downloading JSON:', error);
      
      // Fallback: download original code
      try {
        const fallbackCode = component.json_code || component.code;
        const filename = `${component.title.toLowerCase().replace(/\s+/g, '-')}.json`;
        const blob = new Blob([fallbackCode], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${filename} baixado com sucesso`);
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        toast.error('Erro ao baixar arquivo');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/components/edit/${id}`);
  };

  // Construir URL do site de origem (sempre HTTPS)
  const getSiteOriginUrl = () => {
    if (!component?.source_site) return null;
    
    let siteUrl = component.source_site;
    if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      siteUrl = `https://${siteUrl}`;
    }
    
    return siteUrl.replace(/\/$/, ''); // Remove trailing slash
  };

  // Construir URL completa do post
  const getPostUrl = () => {
    if (component?.source === 'wordpress' && component.source_site && component.slug) {
      const siteOrigin = getSiteOriginUrl();
      if (siteOrigin) {
        return `${siteOrigin}/${component.slug}/`;
      }
    }
    return null;
  };

  const imageSrc = component?.preview_image || '/placeholder.svg';
  const siteOriginUrl = getSiteOriginUrl();
  const postUrl = getPostUrl();

  return (
    <PageWrapper>
      {isLoading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div>Erro ao carregar o componente.</div>
      ) : component ? (
        <>
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="mb-4">
              <Link to="/components">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para a lista
              </Link>
            </Button>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tighter">{component.title}</h1>
                <p className="text-muted-foreground mt-1">
                  Detalhes e opções para o componente selecionado
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Card className="space-y-4">
            <CardHeader className="p-4">
              <CardTitle>Informações do Componente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="relative overflow-hidden rounded-md">
                <img
                  src={imageSrc}
                  alt={component.title}
                  className="w-full h-auto object-cover aspect-video rounded-md"
                  style={{ maxHeight: '400px' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                {component.visibility === 'private' && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <Lock className="h-3 w-3 mr-1" /> Privado
                    </Badge>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Visibilidade:</span>
                  <span>{component.visibility === 'public' ? 'Público' : 'Privado'}</span>
                </div>
                
                {/* Site de Origem - sempre mostrar a URL base */}
                {siteOriginUrl && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Site de Origem:</span>
                    <a 
                      href={siteOriginUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {siteOriginUrl}
                    </a>
                  </div>
                )}

                {/* Link do Post - URL completa do post específico */}
                {postUrl && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span>Link do Post:</span>
                    <a 
                      href={postUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {postUrl}
                    </a>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Criado em:</span>
                  <span>{new Date(component.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Criado por:</span>
                  <span>{component.created_by}</span>
                </div>
                {component.tags && component.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>Tags:</span>
                    <div>
                      {component.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="mr-1">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {component.description && (
                  <div className="grid gap-2">
                    <span>Descrição:</span>
                    <p className="text-muted-foreground">{component.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Código JSON</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)}>
                {showCode ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Esconder Código
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Mostrar Código
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {showCode && (
                <CodeViewer 
                  code={component.json_code || component.code} 
                  useStandardTransform={true}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCopyCode}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar JSON Elementor
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar JSON Elementor
            </Button>
          </div>
        </>
      ) : (
        <div>Componente não encontrado.</div>
      )}
    </PageWrapper>
  );
};

export default ComponentDetail;
