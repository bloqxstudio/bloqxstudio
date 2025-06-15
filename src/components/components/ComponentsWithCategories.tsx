
import React, { useState } from 'react';
import { useInfiniteWordPressComponents } from '@/hooks/useInfiniteWordPressComponents';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import { AlignmentType, ColumnsType, ElementType } from '@/components/ComponentFilters';
import ComponentsFiltersBar from './ComponentsFiltersBar';
import InfiniteComponentsGrid from '@/components/components/InfiniteComponentsGrid';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';

interface ComponentsWithCategoriesProps {
  searchTerm: string;
  selectedCategory: string | null;
  selectedSite: string | null;
  selectedAlignments: AlignmentType[];
  selectedColumns: ColumnsType[];
  selectedElements: ElementType[];
}

const ComponentsWithCategories: React.FC<ComponentsWithCategoriesProps> = ({
  searchTerm,
  selectedCategory,
  selectedSite,
  selectedAlignments,
  selectedColumns,
  selectedElements
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedComponents } = useSelectedComponents();

  // Use infinite scroll hook com os props recebidos
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

  const handleRetry = () => {
    window.location.reload();
  };

  // Filter components based on advanced filters
  const advancedFilteredComponents = React.useMemo(() => {
    return filteredComponents.filter(component => {
      // Alignment filter
      if (selectedAlignments.length > 0 && component.alignment) {
        if (!selectedAlignments.includes(component.alignment as AlignmentType)) {
          return false;
        }
      }

      // Columns filter
      if (selectedColumns.length > 0 && component.columns) {
        if (!selectedColumns.includes(component.columns as ColumnsType)) {
          return false;
        }
      }

      // Elements filter
      if (selectedElements.length > 0 && component.elements) {
        const hasSelectedElement = selectedElements.some(element => 
          component.elements?.includes(element)
        );
        if (!hasSelectedElement) {
          return false;
        }
      }

      return true;
    });
  }, [filteredComponents, selectedAlignments, selectedColumns, selectedElements]);

  console.log('🎯 Components with categories rendering:', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    advancedFilteredComponents: advancedFilteredComponents.length,
    selectedCategory,
    selectedSite,
    selectedAlignments,
    selectedColumns,
    selectedElements,
    isLoading,
    hasError: !!error,
    hasNextPage,
    isFetchingNextPage,
  });

  return (
    <>
      {/* Components Grid - área rolável com scroll infinito */}
      <div className="flex-1 overflow-auto p-6">
        <InfiniteComponentsGrid 
          components={components}
          filteredComponents={advancedFilteredComponents}
          isLoading={isLoading}
          error={error}
          handleRetry={handleRetry}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>

      {selectedComponents.length > 0 && (
        <SelectionFloatingButton />
      )}

      <SelectedComponentsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
};

// Export the filters bar component wrapper - agora apenas um wrapper que recebe props
export const ComponentsFiltersBarWrapper: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  selectedSite: string | null;
  selectedAlignments: AlignmentType[];
  selectedColumns: ColumnsType[];
  selectedElements: ElementType[];
  onAlignmentChange: (alignment: AlignmentType) => void;
  onColumnsChange: (columns: ColumnsType) => void;
  onElementChange: (element: ElementType) => void;
  onClearFilter: (filterType: 'alignment' | 'columns' | 'element') => void;
  onClearAllFilters: () => void;
}> = (props) => {
  const {
    components,
    filteredComponents,
  } = useInfiniteWordPressComponents({
    searchTerm: props.searchTerm,
    selectedCategory: props.selectedCategory,
    selectedSite: props.selectedSite,
  });

  return (
    <ComponentsFiltersBar
      searchTerm={props.searchTerm}
      setSearchTerm={props.setSearchTerm}
      selectedCategory={props.selectedCategory}
      selectedSite={props.selectedSite}
      selectedAlignments={props.selectedAlignments}
      selectedColumns={props.selectedColumns}
      selectedElements={props.selectedElements}
      onAlignmentChange={props.onAlignmentChange}
      onColumnsChange={props.onColumnsChange}
      onElementChange={props.onElementChange}
      onClearFilter={props.onClearFilter}
      filteredCount={filteredComponents.length}
      totalCount={components.length}
      onClearAllFilters={props.onClearAllFilters}
    />
  );
};

export default ComponentsWithCategories;
