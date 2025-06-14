
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageWrapper from '@/components/layout/PageWrapper';

// Interface para componentes do WordPress
interface WordPressPost {
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
  meta?: {
    _elementor_data?: string;
  };
}

// Função para buscar componentes do WordPress com múltiplas tentativas
const getWordPressElementorComponents = async (search?: string): Promise<WordPressPost[]> => {
  console.log('Tentando buscar componentes do WordPress...');
  
  // URLs para tentar em ordem de prioridade
  const urls = [
    'https://superelements.io/wp-json/wp/v2/elementor_library',
    'https://superelements.io/wp-json/wp/v2/posts?post_type=elementor_library',
    'https://superelements.io/wp-json/wp/v2/posts'
  ];
  
  let lastError = null;
  
  for (const baseUrl of urls) {
    try {
      let url = `${baseUrl}?per_page=100&orderby=date&order=desc`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      console.log('Tentando URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        // Filtrar apenas posts do tipo elementor_library se possível
        if (Array.isArray(data)) {
          const filtered = data.filter(item => 
            !item.type || item.type === 'elementor_library' || item.post_type === 'elementor_library'
          );
          return filtered.length > 0 ? filtered : data;
        }
        
        return data || [];
      } else {
        const errorText = await response.text();
        console.error(`Erro ${response.status}:`, errorText);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      lastError = error;
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  throw lastError || new Error('Todas as tentativas de conexão falharam');
};

const SuperelementsComponents = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: components = [], isLoading, error, refetch } = useQuery({
    queryKey: ['wordpress-elementor-components', searchTerm],
    queryFn: () => getWordPressElementorComponents(searchTerm),
    retry: 3,
    retryDelay: 1000,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Componentes WordPress - Superelements</h1>
          <p className="text-muted-foreground text-lg">
            Lista dos componentes Elementor disponíveis no WordPress Superelements
          </p>
        </div>

        {/* Alerta de erro de conexão */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Problema de conexão com o WordPress:</strong></p>
                <p className="text-sm">
                  {error.message.includes('rest_forbidden') 
                    ? 'Acesso negado à API do WordPress. Isso pode indicar que a API REST está desabilitada ou requer autenticação.'
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
                      href="https://superelements.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Visitar Site
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
              Buscar Componentes
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
              Componentes WordPress 
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
                <span>Carregando componentes do WordPress...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground space-y-2">
                  <p>Não foi possível carregar os componentes do WordPress.</p>
                  <p className="text-sm">
                    Possíveis causas: API REST desabilitada, CORS bloqueado, ou permissões insuficientes.
                  </p>
                </div>
              </div>
            ) : components.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum componente encontrado para esta busca.' : 'Nenhum componente encontrado.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {components.map((component, index) => (
                  <div 
                    key={component.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {component.title?.rendered || `Componente ${component.id}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {component.id} • Criado: {component.date ? new Date(component.date).toLocaleDateString('pt-BR') : 'Data não disponível'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                            Ver no WordPress
                          </a>
                        </Button>
                      )}
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
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <p>URLs testadas:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>https://superelements.io/wp-json/wp/v2/elementor_library</li>
                  <li>https://superelements.io/wp-json/wp/v2/posts?post_type=elementor_library</li>
                  <li>https://superelements.io/wp-json/wp/v2/posts</li>
                </ul>
                <p>Total de componentes: {components.length}</p>
                <p>Status: {isLoading ? 'Carregando...' : error ? 'Erro' : 'Sucesso'}</p>
                {error && <p>Erro: {error.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default SuperelementsComponents;
