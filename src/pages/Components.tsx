
import React, { useState } from 'react';
import ComponentsWithCategories, { ComponentsFiltersBarWrapper } from '@/components/components/ComponentsWithCategories';
import FullscreenPageWrapper from '@/components/layout/FullscreenPageWrapper';
import { AlignmentType, ColumnsType, ElementType } from '@/components/ComponentFilters';

const Components = () => {
  // Centralizar todos os estados de filtros aqui
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedAlignments, setSelectedAlignments] = useState<AlignmentType[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<ColumnsType[]>([]);
  const [selectedElements, setSelectedElements] = useState<ElementType[]>([]);

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
    <FullscreenPageWrapper 
      showFilters={true}
      filtersContent={
        <ComponentsFiltersBarWrapper 
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
          onClearAllFilters={handleClearAllFilters}
        />
      }
    >
      <ComponentsWithCategories 
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedSite={selectedSite}
        selectedAlignments={selectedAlignments}
        selectedColumns={selectedColumns}
        selectedElements={selectedElements}
      />
    </FullscreenPageWrapper>
  );
};

export default Components;
