
import React, { useState, useCallback } from 'react';
import { useOptimizedWordPressComponents } from '@/hooks/useOptimizedWordPressComponents';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import { useQuery } from '@tanstack/react-query';
import { getUserWordPressSites } from '@/core/api/wordpress-sites';
import { getUserWordPressCategories } from '@/core/api/wordpress-categories';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/MainSidebar';
import { ContentHeader } from '@/components/layout/ContentHeader';
import OptimizedInfiniteGrid from '@/components/components/OptimizedInfiniteGrid';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';
import { Badge } from '@/components/ui/badge';

const Components = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
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

  // Use optimized hook with parallel loading
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

  // Memoized handlers to avoid re-renders
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

  const handleSiteChange = useCallback((site: string | null) => {
    setSelectedSite(site);
  }, []);

  // Get current view name and counts
  const getCurrentViewInfo = () => {
    if (selectedSite) {
      const site = sites.find(s => s.id === selectedSite);
      return {
        title: site?.site_name || site?.site_url || 'Selected Site',
        count: filteredComponents.length,
        total: components.length,
      };
    }
    
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      return {
        title: category?.name || 'Selected Category',
        count: filteredComponents.length,
        total: components.length,
      };
    }

    return {
      title: 'All components',
      count: filteredComponents.length,
      total: components.length,
    };
  };

  const viewInfo = getCurrentViewInfo();

  console.log('🎯 Components page rendering (unified responsive layout):', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    selectedCategory,
    selectedSite,
    isLoading,
    hasError: !!error,
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Unified Responsive Sidebar */}
        <MainSidebar
          selectedSite={selectedSite}
          onSiteChange={handleSiteChange}
        />

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* Content Header */}
          <ContentHeader 
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search components by title, description or tags..."
            selectedSiteId={selectedSite}
            sites={sites}
            selectedCategory={selectedCategory}
            categories={categories}
          />

          {/* View Title and Component Count */}
          <div className="bg-white border-b border-border px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {viewInfo.title}
                </h1>
                <Badge variant="secondary" className="text-sm">
                  {isLoading ? 'Loading...' : `${viewInfo.count} components`}
                </Badge>
              </div>
              
              {(searchTerm || selectedSite || selectedCategory) && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || selectedSite || searchTerm) && (
            <div className="bg-white border-b border-border px-4 md:px-6 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Search: {searchTerm}
                  </span>
                )}
                {selectedSite && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Site filter applied
                  </span>
                )}
                {selectedCategory && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Category filter applied
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Components Grid */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
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

        {/* Selection Components */}
        {selectedComponents.length > 0 && (
          <SelectionFloatingButton />
        )}

        <SelectedComponentsSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
    </SidebarProvider>
  );
};

export default Components;
