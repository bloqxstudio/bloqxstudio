
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Upload, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';
import { useComponentMigration } from '@/hooks/useComponentMigration';
import MigrationStats from '@/components/migration/MigrationStats';

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
  featured_image_url?: string;
  category_names?: string[];
  tag_names?: string[];
}

const SuperelementsComponents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { stats, migrationMutation, isRunning } = useComponentMigration();

  // Buscar TODOS os posts sem filtros
  const getAllWordPressPosts = async (search?: string): Promise<WordPressPost[]> => {
    console.log('🔍 Buscando TODOS os posts do WordPress...');
    
    const baseUrl = 'https://superelements.io/wp-json/wp/v2/posts';
    let allPosts: WordPressPost[] = [];
    let page = 1;
    const perPage = 100;

    try {
      while (true) {
        const params = new URLSearchParams({
          per_page: perPage.toString(),
          page: page.toString(),
          orderby: 'date',
          order: 'desc',
          _embed: '1'
        });
        
        if (search) {
          params.append('search', search);
        }

        const url = `${baseUrl}?${params.toString()}`;
        console.log(`📡 Página ${page}: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          if (response.status === 400 && page > 1) break;
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) break;

        // Enriquecer posts com metadados
        const postsWithMetadata = await Promise.all(data.map(async (post) => {
          const enrichedPost = { ...post };

          // Buscar imagem destacada
          if (post.featured_media && post.featured_media > 0) {
            try {
              const mediaResponse = await fetch(`https://superelements.io/wp-json/wp/v2/media/${post.featured_media}`);
              if (mediaResponse.ok) {
                const media = await mediaResponse.json();
                enrichedPost.featured_image_url = media.source_url;
              }
            } catch (error) {
              console.warn('Erro ao buscar imagem:', error);
            }
          }

          // Buscar categorias
          if (post.categories && post.categories.length > 0) {
            try {
              const categoriesResponse = await fetch(`https://superelements.io/wp-json/wp/v2/categories?include=${post.categories.join(',')}`);
              if (categoriesResponse.ok) {
                const categories = await categoriesResponse.json();
                enrichedPost.category_names = categories.map((cat: any) => cat.name);
              }
            } catch (error) {
              console.warn('Erro ao buscar categorias:', error);
            }
          }

          // Buscar tags
          if (post.tags && post.tags.length > 0) {
            try {
              const tagsResponse = await fetch(`https://superelements.io/wp-json/wp/v2/tags?include=${post.tags.join(',')}`);
              if (tagsResponse.ok) {
                const tags = await tagsResponse.json();
                enrichedPost.tag_names = tags.map((tag: any) => tag.name);
              }
            } catch (error) {
              console.warn('Erro ao buscar tags:', error);
            }
          }

          return enrichedPost;
        }));

        allPosts = [...allPosts, ...postsWithMetadata];
        console.log(`✅ Página ${page}: ${data.length} posts | Total: ${allPosts.length}`);
        
        page++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`🎯 Total encontrado: ${allPosts.length} posts`);
      return allPosts;
      
    } catch (error) {
      console.error('❌ Erro ao buscar posts:', error);
      throw error;
    }
  };

  const { data: posts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['all-wordpress-posts', searchTerm],
    queryFn: () => getAllWordPressPosts(searchTerm),
    retry: 2,
    retryDelay: 1500,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStartMigration = () => {
    if (posts.length === 0) {
      toast.error('Nenhum post encontrado para migrar');
      return;
    }
    
    migrationMutation.mutate(posts);
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Central de Migração Superelements</h1>
          <p className="text-muted-foreground text-lg">
            Sistema unificado para migrar TODOS os componentes para o banco local
          </p>
        </div>

        {/* Status da Migração */}
        {(isRunning || stats.total > 0) && (
          <div className="mb-6">
            <MigrationStats stats={stats} isRunning={isRunning} />
          </div>
        )}

        {/* Controles de Busca e Migração */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistema de Migração Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar posts específicos (opcional)..."
                  className="flex-1"
                  disabled={isLoading || isRunning}
                />
                <Button 
                  variant="outline"
                  onClick={() => handleSearch('')}
                  disabled={!searchTerm || isLoading || isRunning}
                >
                  Limpar
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <h3 className="font-medium text-blue-900">Migração Completa</h3>
                  <p className="text-sm text-blue-700">
                    {posts.length > 0 
                      ? `${posts.length} posts prontos para migração`
                      : 'Carregando posts...'
                    }
                  </p>
                </div>
                <Button
                  onClick={handleStartMigration}
                  disabled={isLoading || isRunning || posts.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isRunning ? 'Migrando...' : `Migrar Todos (${posts.length})`}
                </Button>
              </div>

              {searchTerm && (
                <div className="mt-4">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    Filtro ativo: "{searchTerm}"
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Detalhadas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Análise dos Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
                <div className="text-sm text-muted-foreground">Total de Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {posts.filter(p => p.featured_image_url).length}
                </div>
                <div className="text-sm text-muted-foreground">Com Imagens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {posts.filter(p => p.category_names && p.category_names.length > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Categorizados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {posts.filter(p => p.content.rendered.includes('style=')).length}
                </div>
                <div className="text-sm text-muted-foreground">Com Estilos CSS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Posts Disponíveis
              {!isLoading && !error && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({posts.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando todos os posts do WordPress...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar posts: {error.message}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refetch()}
                    className="ml-2"
                  >
                    Tentar Novamente
                  </Button>
                </AlertDescription>
              </Alert>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum post encontrado para esta busca.' : 'Nenhum post encontrado.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {posts.slice(0, 50).map((post) => (
                  <div 
                    key={post.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {post.title.rendered}
                        </h3>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>ID: {post.id} • {new Date(post.date).toLocaleDateString('pt-BR')}</div>
                          {post.category_names && post.category_names.length > 0 && (
                            <div>Categorias: {post.category_names.join(', ')}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        {post.featured_image_url && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                            IMG
                          </span>
                        )}
                        {post.content.rendered.includes('style=') && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            CSS
                          </span>
                        )}
                        {post.category_names && post.category_names.length > 0 && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                            CAT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {posts.length > 50 && (
                  <div className="text-center py-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Mostrando 50 de {posts.length} posts. Todos serão migrados.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default SuperelementsComponents;
