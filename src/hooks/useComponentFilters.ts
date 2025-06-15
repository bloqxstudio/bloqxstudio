
import { useState, useMemo } from 'react';
import { Component } from '@/core/types';

interface UseComponentFiltersProps {
  components: Component[];
}

export const useComponentFilters = ({ components }: UseComponentFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedAlignments, setSelectedAlignments] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Calcular fontes disponíveis
  const availableSources = useMemo(() => {
    const sourceMap = new Map();
    
    components.forEach(component => {
      const sourceKey = component.source === 'superelements' ? 'superelements' : 
                       component.source === 'wordpress' ? component.source_site || 'WordPress' : 
                       'local';
      
      const sourceId = component.source === 'superelements' ? 'superelements' :
                      component.source === 'wordpress' ? component.wordpress_site_id || component.source_site :
                      'local';

      if (!sourceMap.has(sourceId)) {
        sourceMap.set(sourceId, {
          id: sourceId,
          name: component.source_site || sourceKey,
          type: component.source === 'superelements' ? 'superelements' : 'wordpress',
          count: 0
        });
      }
      
      sourceMap.get(sourceId).count++;
    });

    return Array.from(sourceMap.values()).sort((a, b) => {
      // Superelements primeiro, depois alfabética
      if (a.type === 'superelements' && b.type !== 'superelements') return -1;
      if (a.type !== 'superelements' && b.type === 'superelements') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [components]);

  // Filtrar componentes
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      // Filtro por fonte
      if (selectedSource !== 'all') {
        const componentSourceId = component.source === 'superelements' ? 'superelements' :
                                 component.source === 'wordpress' ? component.wordpress_site_id || component.source_site :
                                 'local';
        
        if (componentSourceId !== selectedSource) {
          return false;
        }
      }

      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = component.title.toLowerCase().includes(searchLower);
        const descriptionMatch = component.description?.toLowerCase().includes(searchLower);
        const tagsMatch = component.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        const sourceMatch = component.source_site?.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !descriptionMatch && !tagsMatch && !sourceMatch) {
          return false;
        }
      }

      // Filtro por categoria
      if (categoryFilter && component.category !== categoryFilter) {
        return false;
      }

      // Filtro por alinhamento
      if (selectedAlignments.length > 0 && component.alignment) {
        if (!selectedAlignments.includes(component.alignment)) {
          return false;
        }
      }

      // Filtro por colunas
      if (selectedColumns.length > 0 && component.columns) {
        if (!selectedColumns.includes(component.columns)) {
          return false;
        }
      }

      // Filtro por elementos
      if (selectedElements.length > 0 && component.elements) {
        const hasSelectedElement = selectedElements.some(element => 
          component.elements?.includes(element as any)
        );
        if (!hasSelectedElement) {
          return false;
        }
      }

      return true;
    });
  }, [components, selectedSource, searchTerm, categoryFilter, selectedAlignments, selectedColumns, selectedElements]);

  const handleAlignmentChange = (alignment: string, checked: boolean) => {
    setSelectedAlignments(prev => 
      checked 
        ? [...prev, alignment]
        : prev.filter(a => a !== alignment)
    );
  };

  const handleColumnsChange = (columns: string, checked: boolean) => {
    setSelectedColumns(prev => 
      checked 
        ? [...prev, columns]
        : prev.filter(c => c !== columns)
    );
  };

  const handleElementChange = (element: string, checked: boolean) => {
    setSelectedElements(prev => 
      checked 
        ? [...prev, element]
        : prev.filter(e => e !== element)
    );
  };

  const handleClearFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        setSearchQuery('');
        break;
      case 'source':
        setSelectedSource('all');
        break;
      case 'category':
        setCategoryFilter('');
        break;
      case 'alignment':
        setSelectedAlignments([]);
        break;
      case 'columns':
        setSelectedColumns([]);
        break;
      case 'elements':
        setSelectedElements([]);
        break;
      case 'all':
        setSearchTerm('');
        setSearchQuery('');
        setSelectedSource('all');
        setCategoryFilter('');
        setSelectedAlignments([]);
        setSelectedColumns([]);
        setSelectedElements([]);
        break;
    }
  };

  return {
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
    setCategoryFilter,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    filteredComponents,
  };
};
