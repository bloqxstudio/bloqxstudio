
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, ExternalLink, Code, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';
import { getWordPressComponents, getWordPressCategories } from '@/core/api/wordpress';

const WordPressIntegration = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

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

  const apiBaseUrl = `${window.location.origin}/wordpress-api`;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Integração WordPress</h1>
          <p className="text-muted-foreground text-lg">
            API REST pública para integração com WordPress e outros sistemas
          </p>
        </div>

        <Tabs defaultValue="components" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="api">Documentação API</TabsTrigger>
            <TabsTrigger value="plugin">Plugin WordPress</TabsTrigger>
          </TabsList>

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
                      <h4 className="font-medium text-green-600">GET /components/{id}</h4>
                      <p className="text-sm text-muted-foreground">Detalhes de um componente específico</p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">GET /components/{id}/download</h4>
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
                <CardTitle>Plugin WordPress (Em Desenvolvimento)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Estamos desenvolvendo um plugin WordPress que facilitará a integração direta 
                  com o Superelements. O plugin permitirá:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Navegação e busca de componentes diretamente no painel do WordPress</li>
                  <li>Importação automática para a biblioteca do Elementor</li>
                  <li>Sincronização automática de novos componentes</li>
                  <li>Sistema de favoritos e coleções</li>
                  <li>Cache local para melhor performance</li>
                </ul>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Para desenvolvedores</h4>
                  <p className="text-sm text-blue-800">
                    Se você é desenvolvedor e quer criar sua própria integração, 
                    use nossa API REST documentada na aba "Documentação API".
                  </p>
                </div>
                <Button asChild>
                  <a href="mailto:contato@superelements.io" className="inline-flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Solicitar Acesso Beta do Plugin
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
