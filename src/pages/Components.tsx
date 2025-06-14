import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComponents, getCategories } from '@/core/api';
import { useComponentFilters } from '@/hooks/useComponentFilters';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import { useAuth } from '@/features/auth';
import PageWrapper from '@/components/layout/PageWrapper';
import ComponentsHeader from '@/components/components/ComponentsHeader';
import ComponentsGrid from '@/components/components/ComponentsGrid';
import ComponentFilterBar from '@/components/filters/ComponentFilterBar';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';
import type { AlignmentType, ColumnsType, ElementType } from '@/components/ComponentFilters';

const Components = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedComponents } = useSelectedComponents();
  const { user } = useAuth();

  const { data: components = [], isLoading: isLoadingComponents, error, refetch } = useQuery({
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

  return (
    <PageWrapper>
      <ComponentsHeader 
        filteredCount={filteredComponents.length}
        totalCount={components.length}
      />
      
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
        user={user}
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
