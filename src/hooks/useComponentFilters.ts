
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlignmentType, ColumnsType, ElementType } from '@/components/ComponentFilters';
import { Component } from '@/lib/database.types';

export const useComponentFilters = (components: Component[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Get filter parameters from URL as arrays
  const alignmentParams = searchParams.getAll('alignment') as AlignmentType[];
  const columnsParams = searchParams.getAll('columns') as ColumnsType[];
  const elementParams = searchParams.getAll('element') as ElementType[];
  
  // State for multi-select filters
  const [selectedAlignments, setSelectedAlignments] = useState<AlignmentType[]>(alignmentParams);
  const [selectedColumns, setSelectedColumns] = useState<ColumnsType[]>(columnsParams);
  const [selectedElements, setSelectedElements] = useState<ElementType[]>(elementParams);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    selectedAlignments.forEach(alignment => {
      params.append('alignment', alignment);
    });
    
    selectedColumns.forEach(columns => {
      params.append('columns', columns);
    });
    
    selectedElements.forEach(element => {
      params.append('element', element);
    });
    
    setSearchParams(params);
  }, [selectedAlignments, selectedColumns, selectedElements, setSearchParams]);

  // Toggle filter selection (add if not present, remove if present)
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
  
  // Clear filter by type
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

  // Filter components based on search term and other filters
  const filteredComponents = components.filter(component => {
    // Search term filter
    const matchesSearch = searchTerm 
      ? component.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    // Filter by alignments (if any selected)
    const matchesAlignment = selectedAlignments.length === 0 || (
      component.alignment && selectedAlignments.includes(component.alignment as AlignmentType)
    );
    
    // Filter by columns (if any selected)
    const matchesColumns = selectedColumns.length === 0 || (
      component.columns && selectedColumns.includes(component.columns as ColumnsType)
    );
    
    // Filter by elements (if any selected)
    const matchesElement = selectedElements.length === 0 || (
      component.elements && 
      component.elements.some((element: string) => 
        selectedElements.includes(element as ElementType)
      )
    );
    
    return matchesSearch && matchesAlignment && matchesColumns && matchesElement;
  });

  return {
    searchTerm,
    setSearchTerm,
    selectedAlignments,
    selectedColumns,
    selectedElements,
    handleAlignmentChange,
    handleColumnsChange,
    handleElementChange,
    handleClearFilter,
    filteredComponents,
    mobileFiltersOpen,
    setMobileFiltersOpen
  };
};
