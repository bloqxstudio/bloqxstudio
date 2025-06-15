
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComponents } from '@/core/api/components';
import { useWordPressComponentFilters } from '@/hooks/useWordPressComponentFilters';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import PageWrapper from '@/components/layout/PageWrapper';
import ComponentsHeader from '@/components/components/ComponentsHeader';
import ComponentsGrid from '@/components/components/ComponentsGrid';
import WordPressCategoriesSidebar from '@/components/categories/WordPressCategoriesSidebar';
import ComponentSearch from '@/components/filters/ComponentSearch';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';

const ComponentsWithCategories = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedComponents } = useSelectedComponents();

  // Fetch components from all sources
  const { data: components = [], isLoading: isLoadingComponents, error, refetch } = useQuery({
    queryKey: ['all-components'],
    queryFn: getComponents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSite,
    setSelectedSite,
    filteredComponents,
    handleClearFilters,
  } = useWordPressComponentFilters({ components });

  const handleRetry = () => {
    refetch();
  };

  console.log('🎯 Components with categories rendering:', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    selectedCategory,
    selectedSite,
    isLoading: isLoadingComponents,
    hasError: !!error
  });

  return (
    <PageWrapper>
      <div className="flex h-full">
        {/* Left Sidebar - Categories */}
        <WordPressCategoriesSidebar
          selectedCategory={selectedCategory}
          selectedSite={selectedSite}
          onCategoryChange={setSelectedCategory}
          onSiteChange={setSelectedSite}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-6 border-b bg-white">
            <ComponentsHeader 
              filteredCount={filteredComponents.length}
              totalCount={components.length}
              components={components}
            />

            {/* Search */}
            <div className="mt-4">
              <ComponentSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClearSearch={() => setSearchTerm('')}
                placeholder="Search components by title, description, or tags..."
              />
            </div>

            {/* Active Filters */}
            {(selectedCategory || selectedSite || searchTerm) && (
              <div className="mt-4 flex items-center gap-2">
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
            )}
          </div>

          {/* Components Grid */}
          <div className="flex-1 p-6">
            <ComponentsGrid 
              components={components}
              filteredComponents={filteredComponents}
              isLoading={isLoadingComponents}
              error={error}
              handleRetry={handleRetry}
            />
          </div>
        </div>
      </div>

      {selectedComponents.length > 0 && (
        <SelectionFloatingButton />
      )}

      <SelectedComponentsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </PageWrapper>
  );
};

export default ComponentsWithCategories;
