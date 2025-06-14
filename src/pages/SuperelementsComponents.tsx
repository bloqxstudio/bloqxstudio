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
  elementor_meta_data?: string | null;
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
      return media.media_details?.sizes?.medium?.source_url || 
             media.media_details?.sizes?.thumbnail?.source_url || 
             media.source_url;
    }
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
  }
  return null;
};

// Função otimizada para buscar componentes do Elementor com diagnóstico avançado
const getElementorComponents = async (search?: string): Promise<ElementorComponent[]> => {
  console.log('🔍 Iniciando busca com estratégia otimizada baseada na API real...');
  
  // Estratégia focada na URL que o usuário mostrou que funciona
  const baseUrl = 'https://superelements.io/wp-json/wp/v2/posts';
  
  try {
    let url = baseUrl;
    const params = new URLSearchParams({
      per_page: '20',
      orderby: 'date',
      order: 'desc',
      _embed: '1'
    });
    
    if (search) {
      params.append('search', search);
    }
    
    url += '?' + params.toString();
    
    console.log(`📡 Buscando dados da API: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    console.log(`📊 Status da resposta: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Dados recebidos: ${data.length} items`);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ Nenhum dado válido recebido da API');
      return [];
    }

    // Análise detalhada dos dados recebidos
    console.log('\n🔍 ANÁLISE DETALHADA DOS DADOS RECEBIDOS:');
    const firstItem = data[0];
    
    console.log('📋 Estrutura do primeiro item:');
    console.log('- ID:', firstItem.id);
    console.log('- Título:', firstItem.title?.rendered?.substring(0, 50) + '...');
    console.log('- Tipo:', firstItem.type);
    console.log('- Link:', firstItem.link);
    console.log('- Meta existe?', !!firstItem.meta);
    console.log('- Content existe?', !!firstItem.content?.rendered);
    console.log('- Content length:', firstItem.content?.rendered?.length || 0, 'chars');
    
    // Verificar se há estilos inline no HTML
    if (firstItem.content?.rendered) {
      const hasInlineStyles = firstItem.content.rendered.includes('style=');
      const hasElementorClasses = firstItem.content.rendered.includes('elementor');
      const hasDataSettings = firstItem.content.rendered.includes('data-settings');
      
      console.log('🎨 Análise de estilos no HTML:');
      console.log('- Tem estilos inline (style=)?', hasInlineStyles);
      console.log('- Tem classes Elementor?', hasElementorClasses);
      console.log('- Tem data-settings?', hasDataSettings);
      
      if (hasInlineStyles) {
        const styleMatches = firstItem.content.rendered.match(/style="[^"]*"/g);
        console.log('- Número de elementos com style:', styleMatches?.length || 0);
        
        if (styleMatches && styleMatches.length > 0) {
          console.log('- Exemplo de style:', styleMatches[0].substring(0, 100) + '...');
        }
      }
    }
    
    // Verificar metadados
    if (firstItem.meta) {
      console.log('📋 Metadados disponíveis:', Object.keys(firstItem.meta));
      
      if (firstItem.meta._elementor_data) {
        console.log('✅ _elementor_data encontrado!', firstItem.meta._elementor_data.length, 'chars');
      } else {
        console.log('❌ _elementor_data não encontrado nos metadados');
        
        // Verificar outras chaves relacionadas ao Elementor
        const elementorKeys = Object.keys(firstItem.meta).filter(key => 
          key.toLowerCase().includes('elementor')
        );
        console.log('🔍 Chaves relacionadas ao Elementor:', elementorKeys);
      }
    }

    // Processar todos os componentes com extração avançada de estilos
    const processedComponents = await Promise.all(data.map(async (item) => {
      console.log(`\n🔄 Processando componente ${item.id}...`);
      
      // Extrair dados do Elementor do HTML
      const elementorData = extractElementorData(item.content?.rendered || '');
      
      // Usar extração avançada de estilos
      let advancedStyleData = null;
      if (item.content?.rendered) {
        try {
          const { extractAdvancedStyles } = await import('@/utils/elementor/advancedStyleExtractor');
          advancedStyleData = extractAdvancedStyles(item.content.rendered);
          console.log(`✅ Estilos avançados extraídos para ${item.id}:`, {
            inlineStyles: Object.keys(advancedStyleData.inlineStyles).length,
            colors: Object.keys(advancedStyleData.colors).length,
            cssClasses: advancedStyleData.cssClasses.length
          });
        } catch (error) {
          console.warn(`⚠️ Erro na extração avançada para ${item.id}:`, error);
        }
      }
      
      let featuredImageUrl = null;
      if (item.featured_media && item.featured_media > 0) {
        featuredImageUrl = await getFeaturedImageUrl(item.featured_media);
      }
      
      const hasElementorContent = elementorData.hasElementorContent || 
                                 !!item.meta?._elementor_data ||
                                 (advancedStyleData && Object.keys(advancedStyleData.inlineStyles).length > 0);
      
      return {
        ...item,
        featured_image_url: featuredImageUrl,
        elementor_data: elementorData,
        elementor_meta_data: item.meta?._elementor_data || null,
        advanced_style_data: advancedStyleData,
        widget_types: elementorData.widgetTypes,
        has_elementor_content: hasElementorContent,
      } as ElementorComponent & { advanced_style_data?: any };
    }));
    
    const filteredComponents = processedComponents.filter(comp => 
      comp.has_elementor_content
    );
    
    console.log(`\n📊 RESULTADO FINAL:`);
    console.log(`- Total de posts processados: ${data.length}`);
    console.log(`- Com conteúdo Elementor: ${filteredComponents.length}`);
    console.log(`- Com _elementor_data: ${filteredComponents.filter(c => c.elementor_meta_data).length}`);
    console.log(`- Com estilos inline: ${filteredComponents.filter(c => (c as any).advanced_style_data && Object.keys((c as any).advanced_style_data.inlineStyles).length > 0).length}`);
    console.log(`- Com classes CSS: ${filteredComponents.filter(c => (c as any).advanced_style_data && (c as any).advanced_style_data.cssClasses.length > 0).length}`);
    
    return filteredComponents;
    
  } catch (error) {
    console.error('💥 Erro ao buscar componentes:', error);
    throw error;
  }
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

  const handleCopyElementorJson = async (component: ElementorComponent & { advanced_style_data?: any }) => {
    try {
      console.log('🎨 Iniciando cópia com estilos avançados...');
      
      let elementorJson = '';
      
      // Prioridade 1: Usar _elementor_data se disponível
      if (component.elementor_meta_data) {
        console.log('✅ Usando _elementor_data completo do WordPress');
        
        try {
          const parsedData = JSON.parse(component.elementor_meta_data);
          const elementorStructure = {
            type: "elementor",
            siteurl: "https://superelements.io/",
            elements: Array.isArray(parsedData) ? parsedData : [parsedData],
            globals: {}
          };
          elementorJson = JSON.stringify(elementorStructure, null, 2);
        } catch (parseError) {
          console.warn('⚠️ Erro ao parsear _elementor_data:', parseError);
          elementorJson = component.elementor_meta_data;
        }
      }
      // Prioridade 2: Usar estilos avançados extraídos do HTML
      else if (component.advanced_style_data) {
        console.log('🎨 Usando estilos avançados extraídos do HTML');
        
        const { convertStylesToElementorJson } = await import('@/utils/elementor/advancedStyleExtractor');
        elementorJson = convertStylesToElementorJson(
          component.advanced_style_data,
          component.title?.rendered || `Componente ${component.id}`,
          component.content?.rendered || ''
        );
      }
      // Prioridade 3: Fallback para conversão básica do HTML
      else {
        console.log('📝 Usando conversão básica do HTML como fallback...');
        const { convertHtmlToElementorJson } = await import('@/utils/elementor/htmlToJson');
        
        elementorJson = convertHtmlToElementorJson(
          component.content?.rendered || '',
          component.title?.rendered || `Componente ${component.id}`
        );
      }

      await navigator.clipboard.writeText(elementorJson);
      setCopiedId(component.id);
      
      const styleQuality = component.elementor_meta_data 
        ? 'completos e originais' 
        : component.advanced_style_data && Object.keys(component.advanced_style_data.inlineStyles).length > 0
        ? 'extraídos do HTML com estilos inline'
        : 'básicos processados do HTML';
      
      const message = `JSON do Elementor copiado! 🎯\n✅ Estilos ${styleQuality}.\n📏 ${elementorJson.length} caracteres copiados.`;
      
      toast.success(message);
      
      setTimeout(() => setCopiedId(null), 3000);
    } catch (error) {
      console.error('❌ Erro ao copiar JSON:', error);
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

        {/* Alerta de diagnóstico atualizado */}
        {!isLoading && components.length > 0 && (
          <Alert className="mb-6" variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>📊 Status da Conexão:</strong></p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Componentes encontrados:</strong></p>
                    <ul className="list-disc list-inside pl-2">
                      <li>Total: {components.length}</li>
                      <li>Com _elementor_data: {components.filter(c => c.elementor_meta_data).length}</li>
                      <li className="text-green-600">Com estilos inline: {components.filter(c => (c as any).advanced_style_data && Object.keys((c as any).advanced_style_data.inlineStyles).length > 0).length}</li>
                      <li>Com classes CSS: {components.filter(c => (c as any).advanced_style_data && (c as any).advanced_style_data.cssClasses.length > 0).length}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p><strong>Qualidade dos estilos:</strong></p>
                    <ul className="list-disc list-inside pl-2">
                      <li className={components.filter(c => c.elementor_meta_data).length > 0 ? 'text-green-600' : 'text-orange-600'}>
                        Originais: {components.filter(c => c.elementor_meta_data).length > 0 ? 'Disponíveis' : 'Indisponíveis'}
                      </li>
                      <li className={components.filter(c => (c as any).advanced_style_data && Object.keys((c as any).advanced_style_data.inlineStyles).length > 0).length > 0 ? 'text-green-600' : 'text-orange-600'}>
                        Inline: {components.filter(c => (c as any).advanced_style_data && Object.keys((c as any).advanced_style_data.inlineStyles).length > 0).length > 0 ? 'Extraídos' : 'Não encontrados'}
                      </li>
                    </ul>
                  </div>
                </div>
                
                {components.filter(c => (c as any).advanced_style_data && Object.keys((c as any).advanced_style_data.inlineStyles).length > 0).length > 0 && (
                  <div className="bg-green-50 p-3 rounded border-green-200 border mt-3">
                    <p className="font-medium text-green-900">✅ Estilos inline detectados!</p>
                    <p className="text-green-800 text-xs mt-1">
                      O sistema agora consegue extrair estilos CSS inline diretamente do HTML dos posts.
                    </p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

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

        {/* Lista de Componentes com informações de estilo aprimoradas */}
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
                {components.map((component, index) => {
                  const extendedComponent = component as ElementorComponent & { advanced_style_data?: any };
                  const hasAdvancedStyles = extendedComponent.advanced_style_data && 
                    Object.keys(extendedComponent.advanced_style_data.inlineStyles).length > 0;
                  
                  return (
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

                        {/* Conteúdo principal com badges de estilo aprimorados */}
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
                                {component.elementor_meta_data && (
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                    ✨ Dados Originais
                                  </span>
                                )}
                                {hasAdvancedStyles && (
                                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                                    🎨 Estilos Inline
                                  </span>
                                )}
                                {extendedComponent.advanced_style_data && extendedComponent.advanced_style_data.cssClasses.length > 0 && (
                                  <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-2 py-1 rounded">
                                    📋 Classes CSS
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
                                  className={component.elementor_meta_data 
                                    ? "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700" 
                                    : "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
                                  }
                                >
                                  {copiedId === component.id ? (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Copiado!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4 mr-1" />
                                      {component.elementor_meta_data ? 'Copiar Completo' : 'Copiar HTML'}
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
                                      {component.elementor_meta_data && (
                                        <div>
                                          <h4 className="font-medium mb-2 text-purple-700">
                                            ✨ _elementor_data (Dados Completos com Estilos):
                                          </h4>
                                          <pre className="bg-purple-50 border border-purple-200 p-3 rounded text-xs overflow-auto max-h-40">
                                            {component.elementor_meta_data}
                                          </pre>
                                        </div>
                                      )}
                                      
                                      <div>
                                        <h4 className="font-medium mb-2">Dados Elementor Extraídos do HTML:</h4>
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
                                        <h4 className="font-medium mb-2">Todos os Metadados:</h4>
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
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações de Debug Avançado */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Diagnóstico Avançado da API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-3">
                <div>
                  <p><strong>Estratégias testadas (em ordem de prioridade):</strong></p>
                  <ol className="list-decimal list-inside pl-2 space-y-1">
                    <li>REST API V2 com context=edit + meta_key=_elementor_data</li>
                    <li>Elementor Library com context=edit + _embed</li>
                    <li>Posts com _fields específicos</li>
                    <li>Posts padrão com _embed</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Componentes encontrados:</strong></p>
                    <ul className="list-disc list-inside pl-2">
                      <li>Total: {components.length}</li>
                      <li>Com Elementor HTML: {components.filter(c => c.has_elementor_content).length}</li>
                      <li className="text-green-600 font-bold">Com _elementor_data: {components.filter(c => c.elementor_meta_data).length}</li>
                      <li>Com imagens: {components.filter(c => c.featured_image_url).length}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p><strong>Status da configuração:</strong></p>
                    <ul className="list-disc list-inside pl-2">
                      <li className={isLoading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}>
                        API: {isLoading ? 'Carregando...' : error ? 'Erro' : 'Conectada'}
                      </li>
                      <li className={components.filter(c => c.elementor_meta_data).length > 0 ? 'text-green-600' : 'text-orange-600'}>
                        _elementor_data: {components.filter(c => c.elementor_meta_data).length > 0 ? 'Funcionando' : 'Não configurado'}
                      </li>
                    </ul>
                  </div>
                </div>

                {components.filter(c => c.elementor_meta_data).length === 0 && (
                  <div className="bg-yellow-50 p-3 rounded border-yellow-200 border">
                    <p className="font-medium text-yellow-900">Para ativar os dados completos:</p>
                    <ol className="list-decimal list-inside text-yellow-800 text-xs mt-1">
                      <li>Adicione o código no functions.php do tema ativo</li>
                      <li>Faça logout e login no WordPress Admin</li>
                      <li>Limpe qualquer cache ativo</li>
                      <li>Recarregue esta página</li>
                    </ol>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default SuperelementsComponents;
