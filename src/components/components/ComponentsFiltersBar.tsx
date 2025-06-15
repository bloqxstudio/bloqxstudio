
import React from 'react';
import { AlignmentType, ColumnsType, ElementType } from '@/components/ComponentFilters';
import ComponentSearch from '@/components/filters/ComponentSearch';
import ComponentFilters from '@/components/ComponentFilters';

interface ComponentsFiltersBarProps {
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
  filteredCount: number;
  totalCount: number;
  onClearAllFilters: () => void;
}

const ComponentsFiltersBar: React.FC<ComponentsFiltersBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  selectedSite,
  selectedAlignments,
  selectedColumns,
  selectedElements,
  onAlignmentChange,
  onColumnsChange,
  onElementChange,
  onClearFilter,
  filteredCount,
  totalCount,
  onClearAllFilters
}) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <ComponentSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
        placeholder="Buscar componentes por título, descrição ou tags..."
      />
      
      {/* Advanced Filters */}
      <ComponentFilters
        selectedAlignments={selectedAlignments}
        selectedColumns={selectedColumns}
        selectedElements={selectedElements}
        onAlignmentChange={onAlignmentChange}
        onColumnsChange={onColumnsChange}
        onElementChange={onElementChange}
        onClearFilter={onClearFilter}
        filteredCount={filteredCount}
        totalCount={totalCount}
      />

      {/* Active Filters Summary */}
      {(selectedCategory || selectedSite || searchTerm) && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Filtros externos ativos:</span>
          {searchTerm && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              Busca: {searchTerm}
            </span>
          )}
          {selectedSite && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Site selecionado
            </span>
          )}
          {selectedCategory && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Categoria selecionada
            </span>
          )}
          <button
            onClick={onClearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
          >
            Limpar todos
          </button>
        </div>
      )}
    </div>
  );
};

export default ComponentsFiltersBar;
