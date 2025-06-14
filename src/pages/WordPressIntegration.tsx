import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, BookOpen, Code, Settings } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import WordPressSiteManager from '@/components/wordpress/WordPressSiteManager';
import WordPressComponentGrid from '@/components/wordpress/WordPressComponentGrid';
import { getWordPressCategories } from '@/core/api/wordpress';

const WordPressIntegration = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categoriesResponse } = useQuery({
    queryKey: ['wordpress-categories'],
    queryFn: getWordPressCategories,
  });

  const categories = categoriesResponse?.data || [];
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

        <Tabs defaultValue="sites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sites" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sites
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Componentes
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="plugin" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Plugin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sites" className="space-y-6">
            <WordPressSiteManager />
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            {/* Filtros */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Filtros</h3>
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
            </div>

            <WordPressComponentGrid 
              selectedCategory={selectedCategory}
              searchTerm={searchTerm}
            />
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
