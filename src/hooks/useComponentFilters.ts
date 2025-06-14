import { useState, useMemo } from 'react';
import { Component } from '@/core/types';

interface UseComponentFiltersProps {
  components: Component[];
}

export const useComponentFilters = ({ components }: UseComponentFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<'public' | 'private' | null>(null);

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

    return filtered;
  }, [components, searchQuery, categoryFilter, visibilityFilter]);

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    visibilityFilter,
    setVisibilityFilter,
    filteredComponents,
  };
};
