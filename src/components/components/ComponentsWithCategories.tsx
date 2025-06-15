
import React, { useState } from 'react';
import { useWordPressDirectComponents } from '@/hooks/useWordPressDirectComponents';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const { selectedComponents } = useSelectedComponents();

  // Fetch components directly from WordPress
  const {
    components,
    filteredComponents,
    isLoading,
    error,
  } = useWordPressDirectComponents({
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
    // The query will automatically retry due to React Query
    window.location.reload();
  };

  console.log('🎯 Components with categories rendering:', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    selectedCategory,
    selectedSite,
    isLoading,
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
                setSearchTerm={setSearchTerm}
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
              isLoading={isLoading}
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
