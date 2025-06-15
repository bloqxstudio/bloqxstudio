
import React, { useEffect, useRef } from 'react';
import { Component } from '@/core/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import ComponentCard from '@/components/ComponentCard';
import { ComponentsGridSkeleton } from '@/components/ui/component-skeleton';

interface OptimizedInfiniteGridProps {
  components: Component[];
  filteredComponents: Component[];
  isLoading: boolean;
  error: unknown;
  handleRetry: () => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const OptimizedInfiniteGrid: React.FC<OptimizedInfiniteGridProps> = React.memo(({
  components,
  filteredComponents,
  isLoading,
  error,
  handleRetry,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection observer otimizado para carregamento mais agressivo
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !fetchNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          console.log('🚀 Triggering fetchNextPage via optimized intersection');
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px', // Aumentado para carregar mais cedo
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Prefetch próximas páginas quando usuário está navegando
  useEffect(() => {
    if (filteredComponents.length > 0 && hasNextPage && !isFetchingNextPage) {
      // Pre-fetch quando temos poucos componentes restantes para mostrar
      const shouldPrefetch = filteredComponents.length % 24 < 6; // Últimos 6 da página
      if (shouldPrefetch && fetchNextPage) {
        console.log('🔄 Pre-fetching next page in background');
        setTimeout(() => fetchNextPage(), 100); // Pequeno delay para não bloquear UI
      }
    }
  }, [filteredComponents.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  console.log('🎯 OptimizedInfiniteGrid rendering:', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    isLoading,
    hasError: !!error,
    hasNextPage,
    isFetchingNextPage,
  });

  // Loading inicial com skeleton otimizado
  if (isLoading && filteredComponents.length === 0) {
    return (
      <div className="space-y-6">
        <ComponentsGridSkeleton count={24} />
      </div>
    );
  }

  if (error && filteredComponents.length === 0) {
    console.error('❌ Error in OptimizedInfiniteGrid:', error);
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

  if (filteredComponents.length === 0 && !isLoading) {
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

  console.log(`🎨 Rendering optimized grid with ${filteredComponents.length} components`);

  return (
    <div className="space-y-6">
      {/* Components Grid - 3 colunas otimizada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((component, index) => {
          console.log(`🔧 Rendering optimized card ${index + 1}:`, {
            id: component.id,
            title: component.title,
            source: component.source,
          });
          
          return (
            <ComponentCard key={component.id} component={component} />
          );
        })}
      </div>

      {/* Infinite scroll trigger - mais agressivo */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando mais componentes...</span>
            </div>
          )}
        </div>
      )}

      {/* End message */}
      {!hasNextPage && filteredComponents.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            ✨ Todos os componentes foram carregados ({filteredComponents.length} total)
          </p>
        </div>
      )}
    </div>
  );
});

OptimizedInfiniteGrid.displayName = 'OptimizedInfiniteGrid';

export default OptimizedInfiniteGrid;
