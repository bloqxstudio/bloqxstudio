
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

// Função para buscar componentes do WordPress
const getWordPressElementorComponents = async (search?: string): Promise<WordPressPost[]> => {
  try {
    const baseUrl = 'https://superelements.io/wp-json/wp/v2';
    let url = `${baseUrl}/elementor_library?per_page=100&orderby=date&order=desc`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    console.log('Fetching WordPress components from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('WordPress components response:', data);
    
    return data || [];
  } catch (error) {
    console.error('Error fetching WordPress components:', error);
    throw error;
  }
};

const SuperelementsComponents = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: components = [], isLoading, error } = useQuery({
    queryKey: ['wordpress-elementor-components', searchTerm],
    queryFn: () => getWordPressElementorComponents(searchTerm),
    retry: 2,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
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
              />
              <Button 
                variant="outline"
                onClick={() => handleSearch('')}
                disabled={!searchTerm}
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
              Componentes WordPress ({components.length})
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
                <p className="text-red-600 mb-4">
                  Erro ao carregar componentes: {error.message}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Tentar Novamente
                </Button>
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
                          {component.title.rendered}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {component.id} • Criado: {new Date(component.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                <p>API URL: https://superelements.io/wp-json/wp/v2/elementor_library</p>
                <p>Total de componentes: {components.length}</p>
                <p>Status: {isLoading ? 'Carregando...' : error ? 'Erro' : 'Sucesso'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default SuperelementsComponents;
