
import React, { useEffect } from 'react';
import { Component } from '@/core/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import ComponentCard from '@/components/ComponentCard';
import { ComponentsGridSkeleton } from '@/components/ui/component-skeleton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface InfiniteComponentsGridProps {
  components: Component[];
  filteredComponents: Component[];
  isLoading: boolean;
  error: unknown;
  handleRetry: () => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const InfiniteComponentsGrid: React.FC<InfiniteComponentsGridProps> = ({
  components,
  filteredComponents,
  isLoading,
  error,
  handleRetry,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  // Intersection observer for infinite scroll
  const { elementRef: loadMoreRef, isVisible: shouldLoadMore } = useIntersectionObserver({
    threshold: 0.1,
  });

  // Trigger next page load when scroll trigger becomes visible
  useEffect(() => {
    if (shouldLoadMore && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [shouldLoadMore, hasNextPage, isFetchingNextPage, fetchNextPage]);

  console.log('🎯 InfiniteComponentsGrid rendering:', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    isLoading,
    hasError: !!error,
    hasNextPage,
    isFetchingNextPage,
  });

  if (isLoading && filteredComponents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando componentes...</p>
          </div>
        </div>
        <ComponentsGridSkeleton count={12} />
      </div>
    );
  }

  if (error && filteredComponents.length === 0) {
    console.error('❌ Error in InfiniteComponentsGrid:', error);
    return (
      <Card className="border-dashed border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <Filter className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar componentes</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Houve um problema ao buscar componentes. Verifique sua conexão e tente novamente.
          </p>
          <Button onClick={handleRetry} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredComponents.length === 0) {
    console.log('📭 No components found after filters');
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Filter className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum componente encontrado</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Não encontramos componentes com os filtros aplicados. Tente ajustar sua busca.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log(`🎨 Rendering infinite grid with ${filteredComponents.length} components`);

  return (
    <div className="space-y-6">
      {/* Components Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
        {filteredComponents.map((component, index) => {
          console.log(`🔧 Rendering card ${index + 1}:`, {
            id: component.id,
            title: component.title,
            source: component.source,
          });
          
          return (
            <ComponentCard key={component.id} component={component} />
          );
        })}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          {isFetchingNextPage ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Carregando mais componentes...</p>
            </div>
          ) : (
            <Button 
              onClick={fetchNextPage}
              variant="outline" 
              className="min-w-32"
            >
              Carregar mais
            </Button>
          )}
        </div>
      )}

      {/* Loading skeleton for next page */}
      {isFetchingNextPage && (
        <ComponentsGridSkeleton count={8} />
      )}

      {/* End message */}
      {!hasNextPage && filteredComponents.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Todos os componentes foram carregados ({filteredComponents.length} total)
          </p>
        </div>
      )}
    </div>
  );
};

export default InfiniteComponentsGrid;
