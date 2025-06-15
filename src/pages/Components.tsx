
import React, { useState, useCallback } from 'react';
import { useOptimizedWordPressComponents } from '@/hooks/useOptimizedWordPressComponents';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import { useQuery } from '@tanstack/react-query';
import { getUserWordPressSites } from '@/core/api/wordpress-sites';
import { getUserWordPressCategories } from '@/core/api/wordpress-categories';
import { FullscreenLayout } from '@/components/layout/FullscreenLayout';
import { MainSidebar } from '@/components/layout/MainSidebar';
import { ContentHeader } from '@/components/layout/ContentHeader';
import OptimizedInfiniteGrid from '@/components/components/OptimizedInfiniteGrid';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';

const Components = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const { selectedComponents } = useSelectedComponents();

  // Fetch sites and categories for the header
  const { data: sites = [] } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
    staleTime: 15 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['wordpress-categories'],
    queryFn: getUserWordPressCategories,
    staleTime: 15 * 60 * 1000,
  });

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

  console.log('🎯 Components page rendering (new layout):', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    selectedCategory,
    selectedSite,
    isLoading,
    hasError: !!error,
  });

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Fixed Left Sidebar */}
      <MainSidebar
        selectedCategory={selectedCategory}
        selectedSite={selectedSite}
        onCategoryChange={handleCategoryChange}
        onSiteChange={handleSiteChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <ContentHeader 
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search components by title, description or tags..."
          selectedSiteId={selectedSite}
          sites={sites}
          selectedCategory={selectedCategory}
          categories={categories}
        />

        {/* Active Filters */}
        {(selectedCategory || selectedSite || searchTerm) && (
          <div className="bg-white border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Search: {searchTerm}
                </span>
              )}
              {selectedSite && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Site selected
                </span>
              )}
              {selectedCategory && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Category selected
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Components Grid */}
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
      </div>

      {/* Selection Components */}
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

export default Components;
