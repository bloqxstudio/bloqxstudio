
import React, { useState, useCallback } from 'react';
import { useOptimizedWordPressComponents } from '@/hooks/useOptimizedWordPressComponents';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import ComponentsHeader from '@/components/components/ComponentsHeader';
import OptimizedInfiniteGrid from '@/components/components/OptimizedInfiniteGrid';
import { OptimizedComponentSearch } from '@/components/filters/OptimizedComponentSearch';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';
import { OptimizedAppSidebar } from '@/components/layout/OptimizedAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const ComponentsWithCategories: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const { selectedComponents } = useSelectedComponents();

  // Use hook otimizado com carregamento paralelo
  const {
    components,
    filteredComponents,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOptimizedWordPressComponents({
    searchTerm,
    selectedCategory,
    selectedSite,
  });

  // Memoized handlers para evitar re-renders
  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSite(null);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  const handleSiteChange = useCallback((site: string | null) => {
    setSelectedSite(site);
  }, []);

  console.log('🎯 ComponentsWithCategories rendering (optimized):', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    selectedCategory,
    selectedSite,
    isLoading,
    hasError: !!error,
    hasNextPage,
    isFetchingNextPage,
  });

  return (
    <div className="flex-1 flex flex-col w-full pt-16">
      <SidebarProvider>
        <div className="flex flex-1 w-full">
          <OptimizedAppSidebar
            selectedCategory={selectedCategory}
            selectedSite={selectedSite}
            onCategoryChange={handleCategoryChange}
            onSiteChange={handleSiteChange}
          />
          
          <SidebarInset className="flex flex-col flex-1 min-w-0">
            {/* Header fixo */}
            <div className="border-b bg-white p-6 flex-shrink-0">
              <ComponentsHeader 
                filteredCount={filteredComponents.length}
                totalCount={components.length}
                components={components}
              />

              {/* Search otimizado com debounce */}
              <div className="mt-4">
                <OptimizedComponentSearch
                  onSearchChange={handleSearchChange}
                  placeholder="Buscar componentes por título, descrição ou tags..."
                />
              </div>

              {/* Active Filters */}
              {(selectedCategory || selectedSite || searchTerm) && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                  {searchTerm && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Busca: {searchTerm}
                    </span>
                  )}
                  {selectedSite && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Site selecionado
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Categoria selecionada
                    </span>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
                  >
                    Limpar todos
                  </button>
                </div>
              )}
            </div>

            {/* Components Grid - área rolável com scroll infinito otimizado */}
            <div className="flex-1 overflow-auto p-6">
              <OptimizedInfiniteGrid 
                components={components}
                filteredComponents={filteredComponents}
                isLoading={isLoading}
                error={error}
                handleRetry={handleRetry}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {selectedComponents.length > 0 && (
        <SelectionFloatingButton />
      )}

      <SelectedComponentsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
};

export default ComponentsWithCategories;
