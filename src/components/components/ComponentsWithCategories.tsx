
import React, { useState } from 'react';
import { useInfiniteWordPressComponents } from '@/hooks/useInfiniteWordPressComponents';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import ComponentsHeader from '@/components/components/ComponentsHeader';
import InfiniteComponentsGrid from '@/components/components/InfiniteComponentsGrid';
import ComponentSearch from '@/components/filters/ComponentSearch';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const ComponentsWithCategories = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const { selectedComponents } = useSelectedComponents();

  // Use infinite scroll hook instead of regular hook
  const {
    components,
    filteredComponents,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteWordPressComponents({
    searchTerm,
    selectedCategory,
    selectedSite,
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSite(null);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  console.log('🎯 Components with categories rendering:', {
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
    <div className="flex-1 flex flex-col w-full">
      <SidebarProvider>
        <div className="flex flex-1 w-full">
          <AppSidebar
            selectedCategory={selectedCategory}
            selectedSite={selectedSite}
            onCategoryChange={setSelectedCategory}
            onSiteChange={setSelectedSite}
          />
          
          <SidebarInset className="flex flex-col flex-1 min-w-0">
            {/* Header fixo */}
            <div className="border-b bg-white p-6 flex-shrink-0">
              <ComponentsHeader 
                filteredCount={filteredComponents.length}
                totalCount={components.length}
                components={components}
              />

              {/* Search */}
              <div className="mt-4">
                <ComponentSearch
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onClearSearch={() => setSearchTerm('')}
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

            {/* Components Grid - área rolável com scroll infinito */}
            <div className="flex-1 overflow-auto p-6">
              <InfiniteComponentsGrid 
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
