
import React, { useState } from 'react';
import { useInfiniteWordPressComponents } from '@/hooks/useInfiniteWordPressComponents';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import { AlignmentType, ColumnsType, ElementType } from '@/components/ComponentFilters';
import ComponentsFiltersBar from './ComponentsFiltersBar';
import InfiniteComponentsGrid from '@/components/components/InfiniteComponentsGrid';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';
import SelectionFloatingButton from '@/components/selection/SelectionFloatingButton';

const ComponentsWithCategories = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedAlignments, setSelectedAlignments] = useState<AlignmentType[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ColumnsType[]>([]);
  const [selectedElements, setSelectedElements] = useState<ElementType[]>([]);
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

  const handleAlignmentChange = (alignment: AlignmentType) => {
    setSelectedAlignments(prev => 
      prev.includes(alignment) 
        ? prev.filter(a => a !== alignment)
        : [...prev, alignment]
    );
  };

  const handleColumnsChange = (columns: ColumnsType) => {
    setSelectedColumns(prev => 
      prev.includes(columns) 
        ? prev.filter(c => c !== columns)
        : [...prev, columns]
    );
  };

  const handleElementChange = (element: ElementType) => {
    setSelectedElements(prev => 
      prev.includes(element) 
        ? prev.filter(e => e !== element)
        : [...prev, element]
    );
  };

  const handleClearFilter = (filterType: 'alignment' | 'columns' | 'element') => {
    switch (filterType) {
      case 'alignment':
        setSelectedAlignments([]);
        break;
      case 'columns':
        setSelectedColumns([]);
        break;
      case 'element':
        setSelectedElements([]);
        break;
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSite(null);
    setSelectedAlignments([]);
    setSelectedColumns([]);
    setSelectedElements([]);
  };

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

// Export the filters bar component so it can be used in the page
export const ComponentsFiltersBarWrapper = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedAlignments, setSelectedAlignments] = useState<AlignmentType[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ColumnsType[]>([]);
  const [selectedElements, setSelectedElements] = useState<ElementType[]>([]);

  const {
    components,
    filteredComponents,
  } = useInfiniteWordPressComponents({
    searchTerm,
    selectedCategory,
    selectedSite,
  });

  const handleAlignmentChange = (alignment: AlignmentType) => {
    setSelectedAlignments(prev => 
      prev.includes(alignment) 
        ? prev.filter(a => a !== alignment)
        : [...prev, alignment]
    );
  };

  const handleColumnsChange = (columns: ColumnsType) => {
    setSelectedColumns(prev => 
      prev.includes(columns) 
        ? prev.filter(c => c !== columns)
        : [...prev, columns]
    );
  };

  const handleElementChange = (element: ElementType) => {
    setSelectedElements(prev => 
      prev.includes(element) 
        ? prev.filter(e => e !== element)
        : [...prev, element]
    );
  };

  const handleClearFilter = (filterType: 'alignment' | 'columns' | 'element') => {
    switch (filterType) {
      case 'alignment':
        setSelectedAlignments([]);
        break;
      case 'columns':
        setSelectedColumns([]);
        break;
      case 'element':
        setSelectedElements([]);
        break;
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSite(null);
    setSelectedAlignments([]);
    setSelectedColumns([]);
    setSelectedElements([]);
  };

  return (
    <ComponentsFiltersBar
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCategory={selectedCategory}
      selectedSite={selectedSite}
      selectedAlignments={selectedAlignments}
      selectedColumns={selectedColumns}
      selectedElements={selectedElements}
      onAlignmentChange={handleAlignmentChange}
      onColumnsChange={handleColumnsChange}
      onElementChange={handleElementChange}
      onClearFilter={handleClearFilter}
      filteredCount={filteredComponents.length}
      totalCount={components.length}
      onClearAllFilters={handleClearAllFilters}
    />
  );
};

export default ComponentsWithCategories;
