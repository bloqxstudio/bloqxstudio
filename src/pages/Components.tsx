
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComponents, getCategories } from '@/core/api';
import { useComponentFilters } from '@/hooks/useComponentFilters';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import PageWrapper from '@/components/layout/PageWrapper';
import ComponentsHeader from '@/components/components/ComponentsHeader';
import ComponentsGrid from '@/components/components/ComponentsGrid';
import ComponentFilterBar from '@/components/filters/ComponentFilterBar';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';

const Components = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedComponents } = useSelectedComponents();

  const { data: components = [], isLoading: isLoadingComponents } = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    searchQuery,
    setSearchQuery,
    searchTerm,
    setSearchTerm,
    selectedAlignments,
    selectedColumns,
    selectedElements,
    handleAlignmentChange,
    handleColumnsChange,
    handleElementChange,
    handleClearFilter,
    categoryFilter,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    filteredComponents,
  } = useComponentFilters({ components });

  return (
    <PageWrapper>
      <ComponentsHeader />
      
      <ComponentFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={categories}
        selectedAlignments={selectedAlignments}
        selectedColumns={selectedColumns}
        selectedElements={selectedElements}
        handleAlignmentChange={handleAlignmentChange}
        handleColumnsChange={handleColumnsChange}
        handleElementChange={handleElementChange}
        handleClearFilter={handleClearFilter}
        mobileFiltersOpen={mobileFiltersOpen}
        setMobileFiltersOpen={setMobileFiltersOpen}
      />

      <ComponentsGrid 
        components={filteredComponents} 
        isLoading={isLoadingComponents} 
      />

      {selectedComponents.length > 0 && (
        <SelectionFloatingButton
          count={selectedComponents.length}
          onClick={() => setSidebarOpen(true)}
        />
      )}

      <SelectedComponentsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </PageWrapper>
  );
};

export default Components;
