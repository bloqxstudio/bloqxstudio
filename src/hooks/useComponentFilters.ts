
import { useState, useMemo } from 'react';
import type { Component } from '@/core/types';

interface UseComponentFiltersProps {
  components: Component[];
}

export const useComponentFilters = ({ components }: UseComponentFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<'public' | 'private' | null>(null);
  const [selectedAlignments, setSelectedAlignments] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredComponents = useMemo(() => {
    let filtered = components;

    if (searchQuery) {
      filtered = filtered.filter(component =>
        component.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(component => component.category === categoryFilter);
    }

    if (visibilityFilter) {
      filtered = filtered.filter(component => component.visibility === visibilityFilter);
    }

    if (selectedAlignments.length > 0) {
      filtered = filtered.filter(component => 
        component.alignment && selectedAlignments.includes(component.alignment)
      );
    }

    if (selectedColumns.length > 0) {
      filtered = filtered.filter(component => 
        component.columns && selectedColumns.includes(component.columns)
      );
    }

    if (selectedElements.length > 0) {
      filtered = filtered.filter(component => 
        component.elements && component.elements.some(element => selectedElements.includes(element))
      );
    }

    return filtered;
  }, [components, searchQuery, categoryFilter, visibilityFilter, selectedAlignments, selectedColumns, selectedElements]);

  const handleAlignmentChange = (alignment: string, checked: boolean) => {
    setSelectedAlignments(prev => 
      checked ? [...prev, alignment] : prev.filter(a => a !== alignment)
    );
  };

  const handleColumnsChange = (columns: string, checked: boolean) => {
    setSelectedColumns(prev => 
      checked ? [...prev, columns] : prev.filter(c => c !== columns)
    );
  };

  const handleElementChange = (element: string, checked: boolean) => {
    setSelectedElements(prev => 
      checked ? [...prev, element] : prev.filter(e => e !== element)
    );
  };

  const handleClearFilter = () => {
    setSearchQuery('');
    setCategoryFilter(null);
    setVisibilityFilter(null);
    setSelectedAlignments([]);
    setSelectedColumns([]);
    setSelectedElements([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchTerm: searchQuery, // Alias for backward compatibility
    setSearchTerm: setSearchQuery, // Alias for backward compatibility
    categoryFilter,
    setCategoryFilter,
    visibilityFilter,
    setVisibilityFilter,
    selectedAlignments,
    selectedColumns,
    selectedElements,
    handleAlignmentChange,
    handleColumnsChange,
    handleElementChange,
    handleClearFilter,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    filteredComponents,
  };
};
