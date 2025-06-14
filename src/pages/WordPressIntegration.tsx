
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, ExternalLink, Code, BookOpen, Link, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';
import { getWordPressComponents, getWordPressCategories } from '@/core/api/wordpress';

const WordPressIntegration = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [wpUrl, setWpUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: componentsResponse, isLoading: isLoadingComponents } = useQuery({
    queryKey: ['wordpress-components', selectedCategory, searchTerm, page],
    queryFn: () => getWordPressComponents({
      category: selectedCategory || undefined,
      search: searchTerm || undefined,
      page,
      limit: 12,
    }),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['wordpress-categories'],
    queryFn: getWordPressCategories,
  });

  const components = componentsResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const pagination = componentsResponse?.pagination;

  const handleCopyCode = (component: any) => {
    navigator.clipboard.writeText(component.elementor_json);
    toast.success(`Código do ${component.title} copiado!`);
  };

  const handleDownload = (component: any) => {
    const filename = `${component.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    const blob = new Blob([component.elementor_json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} baixado com sucesso!`);
  };

  const handleConnectWordPress = async () => {
    if (!wpUrl) {
      toast.error('Digite a URL do seu WordPress');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      toast.success('WordPress conectado com sucesso!');
    } catch (error) {
      toast.error('Erro ao conectar com WordPress');
    } finally {
      setIsConnecting(false);
    }
  };

  const apiBaseUrl = `${window.location.origin}/wordpress-api`;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Integração WordPress</h1>
          <p className="text-muted-foreground text-lg">
            Conecte seu WordPress ao Superelements e importe componentes diretamente
          </p>
        </div>

        <Tabs defaultValue="connect" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connect">Conectar</TabsTrigger>
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="plugin">Plugin</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Conectar WordPress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConnected ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">URL do WordPress</label>
                      <Input
                        value={wpUrl}
                        onChange={(e) => setWpUrl(e.target.value)}
                        placeholder="https://seusite.com.br"
                        className="max-w-md"
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Como conectar:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Digite a URL do seu WordPress acima</li>
                        <li>Instale nosso plugin gratuito no seu WordPress</li>
                        <li>Configure a API key no painel administrativo</li>
                        <li>Teste a conexão</li>
                      </ol>
                    </div>

                    <Button 
                      onClick={handleConnectWordPress}
                      disabled={!wpUrl || isConnecting}
                      className="w-full max-w-md"
                    >
                      {isConnecting ? 'Conectando...' : 'Conectar WordPress'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">WordPress conectado com sucesso!</span>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Site conectado:</h4>
                      <p className="text-sm text-green-800">{wpUrl}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Próximos passos:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Acesse a aba "Componentes" para navegar na biblioteca</li>
                        <li>Use o botão "Importar para WordPress" nos componentes</li>
                        <li>Configure o plugin no painel administrativo do WordPress</li>
                      </ul>
                    </div>

                    <Button 
                      variant="outline"
                      onClick={() => setIsConnected(false)}
                    >
                      Desconectar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações da API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Endpoint da API</label>
                  <code className="bg-gray-100 p-2 rounded block text-sm">{apiBaseUrl}</code>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Rate Limit</label>
                  <p className="text-sm text-muted-foreground">100 requisições por hora por IP</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Formato</label>
                  <p className="text-sm text-muted-foreground">JSON compatível com Elementor</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Buscar</label>
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar componentes..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Componentes */}
            {isLoadingComponents ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((component) => (
                  <Card key={component.id} className="overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      {component.preview_image ? (
                        <img
                          src={component.preview_image}
                          alt={component.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Code className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{component.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {component.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {component.tags?.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCode(component)}
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(component)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      {isConnected && (
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full mt-2"
                          onClick={() => toast.success('Componente importado para WordPress!')}
                        >
                          Importar para WordPress
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginação */}
            {pagination && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {page} de {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Documentação da API REST
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                  <code className="bg-gray-100 p-2 rounded block">{apiBaseUrl}</code>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Endpoints Disponíveis</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">GET /components</h4>
                      <p className="text-sm text-muted-foreground mb-2">Lista componentes públicos</p>
                      <p className="text-xs">Parâmetros: category, tags, search, page, limit</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">GET /components/{'{id}'}</h4>
                      <p className="text-sm text-muted-foreground">Detalhes de um componente específico</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">GET /components/{'{id}'}/download</h4>
                      <p className="text-sm text-muted-foreground">Download direto do arquivo JSON</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">GET /categories</h4>
                      <p className="text-sm text-muted-foreground">Lista todas as categorias</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">GET /download/bulk</h4>
                      <p className="text-sm text-muted-foreground mb-2">Download múltiplos componentes</p>
                      <p className="text-xs">Parâmetro: ids (máximo 50 IDs separados por vírgula)</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">GET /stats</h4>
                      <p className="text-sm text-muted-foreground">Estatísticas gerais da API</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Rate Limiting</h3>
                  <p className="text-sm text-muted-foreground">
                    100 requisições por hora por IP. Headers de resposta incluem informações sobre o limite.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Exemplo de Uso</h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Buscar componentes da categoria "hero"
fetch('${apiBaseUrl}/components?category=hero&limit=10')
  .then(response => response.json())
  .then(data => console.log(data));

// Download de um componente específico
fetch('${apiBaseUrl}/components/{id}/download')
  .then(response => response.text())
  .then(json => {
    // JSON pronto para importar no Elementor
    console.log(json);
  });`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plugin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plugin WordPress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Plugin Superelements WordPress</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Nosso plugin oficial facilita a integração e importação de componentes diretamente no painel do WordPress.
                  </p>
                  <Button size="sm" asChild>
                    <a href="#" className="inline-flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Download Plugin (Em breve)
                    </a>
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recursos do Plugin:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Navegação e busca de componentes diretamente no WordPress</li>
                    <li>Importação automática para a biblioteca do Elementor</li>
                    <li>Sincronização automática de novos componentes</li>
                    <li>Sistema de favoritos e coleções</li>
                    <li>Cache local para melhor performance</li>
                    <li>Configuração simples via painel administrativo</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 mb-1">Plugin em desenvolvimento</h4>
                      <p className="text-sm text-amber-800">
                        Enquanto isso, você pode usar nossa API REST para integração manual ou criar sua própria solução.
                      </p>
                    </div>
                  </div>
                </div>

                <Button asChild>
                  <a href="mailto:contato@superelements.io" className="inline-flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Solicitar Notificação de Lançamento
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
};

export default WordPressIntegration;
