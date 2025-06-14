import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, ExternalLink, FileText, AlertCircle, Eye, Code, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';

// Interface para componentes do Elementor
interface ElementorComponent {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  modified: string;
  link: string;
  type: string;
  featured_media?: number;
  featured_image_url?: string;
  meta?: {
    _elementor_data?: string;
    _elementor_template_type?: string;
    _elementor_edit_mode?: string;
  };
  elementor_data?: any;
  widget_types?: string[];
  has_elementor_content: boolean;
}

// Interface para media do WordPress
interface WordPressMedia {
  id: number;
  source_url: string;
  media_details?: {
    sizes?: {
      thumbnail?: { source_url: string };
      medium?: { source_url: string };
    };
  };
}

// Função para extrair dados do Elementor do HTML
const extractElementorData = (htmlContent: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Procurar por elementos com data-elementor-*
  const elementorElements = doc.querySelectorAll('[data-elementor-type], [data-elementor-id]');
  const widgets = doc.querySelectorAll('[data-widget_type]');
  
  const widgetTypes = Array.from(widgets).map(widget => 
    widget.getAttribute('data-widget_type')?.replace('.default', '') || 'unknown'
  );
  
  return {
    hasElementorContent: elementorElements.length > 0,
    elementorType: elementorElements[0]?.getAttribute('data-elementor-type') || null,
    elementorId: elementorElements[0]?.getAttribute('data-elementor-id') || null,
    widgetTypes: [...new Set(widgetTypes)],
    totalElements: elementorElements.length,
    totalWidgets: widgets.length
  };
};

// Função para buscar URL da imagem destacada
const getFeaturedImageUrl = async (mediaId: number): Promise<string | null> => {
  try {
    const response = await fetch(`https://superelements.io/wp-json/wp/v2/media/${mediaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (response.ok) {
      const media: WordPressMedia = await response.json();
      // Priorizar thumbnail, depois medium, por último source_url original
      return media.media_details?.sizes?.medium?.source_url || 
             media.media_details?.sizes?.thumbnail?.source_url || 
             media.source_url;
    }
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
  }
  return null;
};

// Função para buscar componentes do Elementor com múltiplas estratégias
const getElementorComponents = async (search?: string): Promise<ElementorComponent[]> => {
  console.log('🔍 Buscando componentes do Elementor...');
  
  // Estratégias em ordem de prioridade
  const strategies = [
    {
      name: 'Elementor Library Endpoint',
      url: 'https://superelements.io/wp-json/wp/v2/elementor_library',
      params: 'per_page=50&orderby=date&order=desc'
    },
    {
      name: 'Posts with Elementor Library Type',
      url: 'https://superelements.io/wp-json/wp/v2/posts',
      params: 'post_type=elementor_library&per_page=50&orderby=date&order=desc'
    },
    {
      name: 'All Posts Filtered by Elementor',
      url: 'https://superelements.io/wp-json/wp/v2/posts',
      params: 'per_page=100&orderby=date&order=desc&search=elementor'
    },
    {
      name: 'General Posts Search',
      url: 'https://superelements.io/wp-json/wp/v2/posts',
      params: 'per_page=100&orderby=date&order=desc'
    }
  ];
  
  let lastError = null;
  let allComponents: ElementorComponent[] = [];
  
  for (const strategy of strategies) {
    try {
      let url = `${strategy.url}?${strategy.params}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      console.log(`📡 Tentando estratégia: ${strategy.name}`);
      console.log(`🌐 URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      console.log(`📊 Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Dados recebidos (${strategy.name}):`, data.length, 'items');
        
        if (Array.isArray(data) && data.length > 0) {
          // Processar cada item para extrair dados do Elementor
          const processedComponents = await Promise.all(data.map(async (item) => {
            const elementorData = extractElementorData(item.content?.rendered || '');
            
            // Buscar imagem destacada se disponível
            let featuredImageUrl = null;
            if (item.featured_media && item.featured_media > 0) {
              featuredImageUrl = await getFeaturedImageUrl(item.featured_media);
            }
            
            return {
              ...item,
              featured_image_url: featuredImageUrl,
              elementor_data: elementorData,
              widget_types: elementorData.widgetTypes,
              has_elementor_content: elementorData.hasElementorContent,
            } as ElementorComponent;
          }));
          
          // Filtrar apenas componentes com conteúdo Elementor se for estratégia geral
          const filteredComponents = strategy.name.includes('General') ? 
            processedComponents.filter(comp => comp.has_elementor_content) :
            processedComponents;
          
          if (filteredComponents.length > 0) {
            allComponents = filteredComponents;
            console.log(`🎯 Encontrados ${filteredComponents.length} componentes com Elementor`);
            break;
          }
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ Erro ${response.status} (${strategy.name}):`, errorText);
        lastError = new Error(`${strategy.name}: HTTP ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error(`💥 Erro na estratégia ${strategy.name}:`, error);
      lastError = error;
    }
  }
  
  if (allComponents.length === 0) {
    throw lastError || new Error('Nenhuma estratégia funcionou para acessar os componentes do Elementor');
  }
  
  return allComponents;
};

const SuperelementsComponents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: components = [], isLoading, error, refetch } = useQuery({
    queryKey: ['elementor-components', searchTerm],
    queryFn: () => getElementorComponents(searchTerm),
    retry: 2,
    retryDelay: 1500,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleRetry = () => {
    refetch();
  };

  const handleCopyElementorJson = async (component: ElementorComponent) => {
    try {
      // Import the conversion utility
      const { convertHtmlToElementorJson } = await import('@/utils/elementor/htmlToJson');
      
      // Convert HTML content to proper Elementor JSON format
      const elementorJson = convertHtmlToElementorJson(
        component.content?.rendered || '',
        component.title?.rendered || `Componente ${component.id}`
      );

      await navigator.clipboard.writeText(elementorJson);
      setCopiedId(component.id);
      toast.success(`JSON do Elementor copiado! Agora você pode colar diretamente no Elementor.`);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar JSON:', error);
      toast.error('Erro ao copiar JSON. Tente novamente.');
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Componentes Elementor - Superelements</h1>
          <p className="text-muted-foreground text-lg">
            Biblioteca de componentes Elementor do WordPress Superelements
          </p>
        </div>

        {/* Alerta de erro */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Erro ao acessar componentes Elementor:</strong></p>
                <p className="text-sm">
                  {error.message.includes('rest_forbidden') 
                    ? 'API REST bloqueada - pode ser necessário autenticação ou CORS está bloqueado.'
                    : `Erro: ${error.message}`
                  }
                </p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRetry}
                  >
                    Tentar Novamente
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <a 
                      href="https://superelements.io/wp-admin/edit.php?post_type=elementor_library" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Ver no WordPress
                    </a>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Busca */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Componentes Elementor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Digite o nome do componente..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                variant="outline"
                onClick={() => handleSearch('')}
                disabled={!searchTerm || isLoading}
              >
                Limpar
              </Button>
            </div>
            
            {searchTerm && (
              <div className="mt-4">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  Busca: "{searchTerm}"
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Componentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Componentes Elementor
              {!isLoading && !error && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({components.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando componentes Elementor...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground space-y-2">
                  <p>Não foi possível carregar os componentes Elementor.</p>
                  <p className="text-sm">
                    Verifique se o site permite acesso à API REST ou se há restrições de CORS.
                  </p>
                </div>
              </div>
            ) : components.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum componente encontrado para esta busca.' : 'Nenhum componente Elementor encontrado.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {components.map((component, index) => (
                  <div 
                    key={component.id} 
                    className="border rounded-lg overflow-hidden hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex">
                      {/* Área da imagem */}
                      <div className="w-32 h-32 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        {component.featured_image_url ? (
                          <img
                            src={component.featured_image_url}
                            alt={component.title?.rendered || `Componente ${component.id}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <FileText className="h-8 w-8 mb-1" />
                            <span className="text-xs">Sem imagem</span>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo principal */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                              <h3 className="font-medium text-gray-900">
                                {component.title?.rendered || `Componente ${component.id}`}
                              </h3>
                              {component.has_elementor_content && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                  Elementor
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-500">
                              <p>ID: {component.id} • Tipo: {component.type}</p>
                              <p>Criado: {component.date ? new Date(component.date).toLocaleDateString('pt-BR') : 'Data não disponível'}</p>
                              
                              {component.widget_types && component.widget_types.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="text-xs font-medium">Widgets:</span>
                                  {component.widget_types.slice(0, 5).map((widget, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                      {widget}
                                    </span>
                                  ))}
                                  {component.widget_types.length > 5 && (
                                    <span className="text-xs text-gray-500">
                                      +{component.widget_types.length - 5} mais
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {/* Botão Copiar JSON do Elementor */}
                            {component.has_elementor_content && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleCopyElementorJson(component)}
                                disabled={copiedId === component.id}
                                className="bg-green-50 border-green-200 hover:bg-green-100"
                              >
                                {copiedId === component.id ? (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Copiado!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copiar JSON
                                  </>
                                )}
                              </Button>
                            )}

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver Dados
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Dados do Componente: {component.title?.rendered}
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh]">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Dados Elementor:</h4>
                                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                                        {JSON.stringify(component.elementor_data, null, 2)}
                                      </pre>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">HTML do Componente:</h4>
                                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                                        {component.content?.rendered || 'Sem conteúdo'}
                                      </pre>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">Metadados:</h4>
                                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                                        {JSON.stringify(component.meta || {}, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                            
                            {component.link && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a 
                                  href={component.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Ver no Site
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações de Debug */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Informações de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2">
                <p><strong>Estratégias testadas:</strong></p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>/wp-json/wp/v2/elementor_library (endpoint direto)</li>
                  <li>/wp-json/wp/v2/posts?post_type=elementor_library (via posts)</li>
                  <li>/wp-json/wp/v2/posts com filtro Elementor</li>
                  <li>/wp-json/wp/v2/posts geral (com extração Elementor)</li>
                </ul>
                <p><strong>Total encontrados:</strong> {components.length}</p>
                <p><strong>Com conteúdo Elementor:</strong> {components.filter(c => c.has_elementor_content).length}</p>
                <p><strong>Com imagens:</strong> {components.filter(c => c.featured_image_url).length}</p>
                <p><strong>Status:</strong> {isLoading ? 'Carregando...' : error ? 'Erro' : 'Sucesso'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default SuperelementsComponents;
