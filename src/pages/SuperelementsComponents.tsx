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
  console.log('🔍 Iniciando busca de componentes com nova configuração da API...');
  
  // Estratégias específicas para testar a nova configuração
  const strategies = [
    {
      name: 'REST API V2 com Context Edit e Meta Completo',
      url: 'https://superelements.io/wp-json/wp/v2/posts',
      params: 'context=edit&per_page=20&orderby=date&order=desc&_embed=1&meta_key=_elementor_data'
    },
    {
      name: 'Elementor Library com Context Edit',
      url: 'https://superelements.io/wp-json/wp/v2/elementor_library',
      params: 'context=edit&per_page=20&orderby=date&order=desc&_embed=1'
    },
    {
      name: 'Posts com Meta Fields Específicos',
      url: 'https://superelements.io/wp-json/wp/v2/posts',
      params: 'per_page=20&orderby=date&order=desc&_fields=id,title,content,meta,date,modified,link,type&meta_key=_elementor_data'
    },
    {
      name: 'Posts Simples com Todos os Meta',
      url: 'https://superelements.io/wp-json/wp/v2/posts',
      params: 'per_page=20&orderby=date&order=desc&_embed=1'
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

      console.log(`\n🚀 TESTANDO: ${strategy.name}`);
      console.log(`📡 URL completa: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      console.log(`📊 Status da resposta: ${response.status}`);
      console.log(`📋 Headers da resposta:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Dados recebidos (${strategy.name}):`, data.length, 'items');
        
        if (Array.isArray(data) && data.length > 0) {
          // Análise detalhada do primeiro item
          const firstItem = data[0];
          console.log(`\n🔍 ANÁLISE DETALHADA DO PRIMEIRO ITEM:`);
          console.log(`ID: ${firstItem.id}`);
          console.log(`Título: ${firstItem.title?.rendered || 'N/A'}`);
          console.log(`Tipo: ${firstItem.type || 'N/A'}`);
          console.log(`Meta existe?`, !!firstItem.meta);
          
          if (firstItem.meta) {
            console.log(`📋 Chaves dos metadados:`, Object.keys(firstItem.meta));
            console.log(`🎯 _elementor_data existe?`, !!firstItem.meta._elementor_data);
            
            if (firstItem.meta._elementor_data) {
              console.log(`📏 Tamanho do _elementor_data:`, firstItem.meta._elementor_data.length, 'caracteres');
              console.log(`🎨 Preview dos dados:`, firstItem.meta._elementor_data.substring(0, 200) + '...');
              
              // Tentar parsear como JSON para validar
              try {
                const parsedData = JSON.parse(firstItem.meta._elementor_data);
                console.log(`✅ JSON válido! Estrutura:`, typeof parsedData, Array.isArray(parsedData) ? `Array com ${parsedData.length} items` : 'Objeto');
              } catch (parseError) {
                console.warn(`⚠️ Erro ao parsear JSON:`, parseError);
              }
            } else {
              console.log(`❌ _elementor_data não encontrado em meta`);
              
              // Verificar se existe com outros nomes
              const elementorKeys = Object.keys(firstItem.meta).filter(key => 
                key.includes('elementor') || key.includes('_elementor')
              );
              console.log(`🔍 Chaves relacionadas ao Elementor:`, elementorKeys);
            }
          } else {
            console.log(`❌ Nenhum metadado encontrado no item`);
          }
          
          // Análise do conteúdo HTML
          if (firstItem.content?.rendered) {
            const htmlContent = firstItem.content.rendered;
            const hasElementorHTML = htmlContent.includes('data-elementor') || 
                                   htmlContent.includes('elementor-element');
            console.log(`📄 Conteúdo HTML tem marcações Elementor?`, hasElementorHTML);
            
            if (hasElementorHTML) {
              const elementorMatches = htmlContent.match(/data-elementor-[^=]*="[^"]*"/g);
              console.log(`🎯 Atributos Elementor encontrados:`, elementorMatches?.length || 0);
            }
          }
          
          // Processar todos os itens
          const processedComponents = await Promise.all(data.map(async (item) => {
            const elementorMetaData = item.meta?._elementor_data || null;
            const elementorData = extractElementorData(item.content?.rendered || '');
            
            let featuredImageUrl = null;
            if (item.featured_media && item.featured_media > 0) {
              featuredImageUrl = await getFeaturedImageUrl(item.featured_media);
            }
            
            return {
              ...item,
              featured_image_url: featuredImageUrl,
              elementor_data: elementorData,
              elementor_meta_data: elementorMetaData,
              widget_types: elementorData.widgetTypes,
              has_elementor_content: elementorData.hasElementorContent || !!elementorMetaData,
            } as ElementorComponent;
          }));
          
          const filteredComponents = processedComponents.filter(comp => 
            comp.has_elementor_content || comp.elementor_meta_data
          );
          
          console.log(`\n📊 RESULTADO DA ESTRATÉGIA "${strategy.name}":`);
          console.log(`- Total de posts: ${data.length}`);
          console.log(`- Com conteúdo Elementor: ${filteredComponents.length}`);
          console.log(`- Com _elementor_data completo: ${filteredComponents.filter(c => c.elementor_meta_data).length}`);
          console.log(`- Apenas com HTML: ${filteredComponents.filter(c => !c.elementor_meta_data && c.has_elementor_content).length}`);
          
          if (filteredComponents.length > 0) {
            const withCompleteData = filteredComponents.filter(c => c.elementor_meta_data);
            
            if (withCompleteData.length > 0) {
              console.log(`\n🎉 SUCESSO! Encontrados ${withCompleteData.length} componentes com dados completos!`);
              console.log(`🚀 Estratégia bem-sucedida: "${strategy.name}"`);
              
              // Log dos componentes com dados completos
              withCompleteData.forEach((comp, i) => {
                console.log(`${i + 1}. ${comp.title?.rendered} (ID: ${comp.id}) - ${comp.elementor_meta_data?.length} chars`);
              });
            }
            
            allComponents = filteredComponents;
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
  
  // Diagnóstico final
  console.log(`\n🔍 DIAGNÓSTICO FINAL:`);
  console.log(`- Total de componentes encontrados: ${allComponents.length}`);
  console.log(`- Com _elementor_data: ${allComponents.filter(c => c.elementor_meta_data).length}`);
  console.log(`- Apenas HTML: ${allComponents.filter(c => !c.elementor_meta_data && c.has_elementor_content).length}`);
  
  if (allComponents.filter(c => c.elementor_meta_data).length === 0) {
    console.warn(`\n⚠️ DIAGNÓSTICO: Nenhum _elementor_data encontrado!`);
    console.warn(`Possíveis causas:`);
    console.warn(`1. O código WordPress ainda não foi aplicado corretamente`);
    console.warn(`2. É necessário fazer logout/login no WordPress`);
    console.warn(`3. Cache do WordPress pode estar interferindo`);
    console.warn(`4. Permissões do usuário podem não ser suficientes`);
    console.warn(`5. O hook 'init' pode não estar executando`);
    
    console.warn(`\nSugestões:`);
    console.warn(`1. Verificar se o código foi adicionado ao functions.php`);
    console.warn(`2. Tentar acessar: https://superelements.io/wp-json/wp/v2/posts?_fields=meta&per_page=1`);
    console.warn(`3. Verificar logs de erro do WordPress`);
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
      console.log('🎨 Iniciando cópia dos dados do Elementor...');
      
      let elementorJson = '';
      
      // Prioridade 1: Usar _elementor_data se disponível (dados completos)
      if (component.elementor_meta_data) {
        console.log('✅ Usando _elementor_data completo do WordPress');
        
        try {
          // Verificar se é JSON válido
          const parsedData = JSON.parse(component.elementor_meta_data);
          
          // Criar estrutura Elementor válida com dados completos
          const elementorStructure = {
            type: "elementor",
            siteurl: "https://superelements.io/",
            elements: Array.isArray(parsedData) ? parsedData : [parsedData],
            globals: {}
          };
          
          elementorJson = JSON.stringify(elementorStructure, null, 2);
          
          console.log('🎯 JSON criado com dados completos:', elementorJson.length, 'caracteres');
        } catch (parseError) {
          console.warn('⚠️ Erro ao parsear _elementor_data, usando como string:', parseError);
          elementorJson = component.elementor_meta_data;
        }
      } 
      // Prioridade 2: Processar HTML como fallback
      else {
        console.log('📝 Processando HTML como fallback...');
        const { convertHtmlToElementorJson } = await import('@/utils/elementor/htmlToJson');
        
        elementorJson = convertHtmlToElementorJson(
          component.content?.rendered || '',
          component.title?.rendered || `Componente ${component.id}`
        );
      }

      await navigator.clipboard.writeText(elementorJson);
      setCopiedId(component.id);
      
      const message = component.elementor_meta_data 
        ? `JSON completo do Elementor copiado! 🎯\n✅ Dados originais com todos os estilos preservados.\n📏 ${elementorJson.length} caracteres copiados.`
        : `JSON do Elementor copiado! 🎨\n⚠️ Processado a partir do HTML (estilos limitados).\n📏 ${elementorJson.length} caracteres copiados.`;
      
      toast.success(message);
      
      // Reset copied state after 3 seconds
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

        {/* Alerta de diagnóstico */}
        {!isLoading && components.length > 0 && (
          <Alert className="mb-6" variant={components.filter(c => c.elementor_meta_data).length > 0 ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                {components.filter(c => c.elementor_meta_data).length > 0 ? (
                  <>
                    <p><strong>✅ Conexão bem-sucedida!</strong></p>
                    <p className="text-sm">
                      Encontrados {components.filter(c => c.elementor_meta_data).length} componentes com dados completos do Elementor (_elementor_data).
                    </p>
                  </>
                ) : (
                  <>
                    <p><strong>⚠️ Configuração da API ainda não ativa</strong></p>
                    <p className="text-sm">
                      O código WordPress foi adicionado mas os metadados _elementor_data ainda não estão sendo expostos na API.
                    </p>
                    <div className="mt-3 text-xs space-y-1">
                      <p><strong>Verifique:</strong></p>
                      <ul className="list-disc list-inside pl-2">
                        <li>Se o código foi adicionado no functions.php</li>
                        <li>Se você fez logout/login no WordPress Admin</li>
                        <li>Limpe qualquer cache ativo</li>
                        <li>Se o usuário tem permissão 'edit_posts'</li>
                      </ul>
                    </div>
                  </>
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
                              {component.elementor_meta_data && (
                                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                  ✨ Dados Completos
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
                ))}
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
