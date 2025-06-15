
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComponents } from '@/core/api/components';
import { getCategories } from '@/core/api';
import { useComponentFilters } from '@/hooks/useComponentFilters';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import PageWrapper from '@/components/layout/PageWrapper';
import ComponentsHeader from '@/components/components/ComponentsHeader';
import ComponentsGrid from '@/components/components/ComponentsGrid';
import ComponentFilterBar from '@/components/filters/ComponentFilterBar';
import SourceFilter from '@/components/filters/SourceFilter';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';
import type { AlignmentType, ColumnsType, ElementType } from '@/components/ComponentFilters';

const Components = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedComponents } = useSelectedComponents();

  // Fetch components from all sources
  const { data: components = [], isLoading: isLoadingComponents, error, refetch } = useQuery({
    queryKey: ['all-components'],
    queryFn: getComponents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });

  // Fetch categories (kept for filter compatibility)
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    searchQuery,
    setSearchQuery,
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedAlignments,
    selectedColumns,
    selectedElements,
    availableSources,
    handleAlignmentChange,
    handleColumnsChange,
    handleElementChange,
    handleClearFilter,
    categoryFilter,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    filteredComponents,
  } = useComponentFilters({ components });

  const handleAlignmentToggle = (alignment: AlignmentType) => {
    handleAlignmentChange(alignment, !selectedAlignments.includes(alignment));
  };

  const handleColumnsToggle = (columns: ColumnsType) => {
    handleColumnsChange(columns, !selectedColumns.includes(columns));
  };

  const handleElementToggle = (element: ElementType) => {
    handleElementChange(element, !selectedElements.includes(element));
  };

  const handleClearFilterType = (filterType: 'alignment' | 'columns' | 'element') => {
    if (filterType === 'alignment') {
      selectedAlignments.forEach(alignment => handleAlignmentChange(alignment, false));
    } else if (filterType === 'columns') {
      selectedColumns.forEach(columns => handleColumnsChange(columns, false));
    } else if (filterType === 'element') {
      selectedElements.forEach(element => handleElementChange(element, false));
    }
  };

  const handleRetry = () => {
    refetch();
  };

  console.log('🎯 Components page rendering:', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    availableSources: availableSources.length,
    selectedSource,
    isLoading: isLoadingComponents,
    hasError: !!error
  });

  return (
    <PageWrapper>
      <ComponentsHeader 
        filteredCount={filteredComponents.length}
        totalCount={components.length}
        components={components}
      />

      {/* Source Filter */}
      <div className="mb-4">
        <SourceFilter
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          availableSources={availableSources}
        />
      </div>
      
      <ComponentFilterBar
        selectedAlignments={selectedAlignments as AlignmentType[]}
        selectedColumns={selectedColumns as ColumnsType[]}
        selectedElements={selectedElements as ElementType[]}
        onAlignmentChange={handleAlignmentToggle}
        onColumnsChange={handleColumnsToggle}
        onElementChange={handleElementToggle}
        onClearFilter={handleClearFilterType}
        filteredCount={filteredComponents.length}
        totalCount={components.length}
        mobileFiltersOpen={mobileFiltersOpen}
        setMobileFiltersOpen={setMobileFiltersOpen}
      />

      <ComponentsGrid 
        components={components}
        filteredComponents={filteredComponents}
        isLoading={isLoadingComponents}
        error={error}
        handleRetry={handleRetry}
      />

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

export default Components;
