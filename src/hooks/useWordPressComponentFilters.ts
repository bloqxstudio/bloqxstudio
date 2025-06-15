
import { useState, useMemo } from 'react';
import { Component } from '@/core/types';

interface UseWordPressComponentFiltersProps {
  components: Component[];
}

export const useWordPressComponentFilters = ({ components }: UseWordPressComponentFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  // Filter components based on selected filters
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      // Search filter
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

      // Site filter
      if (selectedSite && component.wordpress_site_id !== selectedSite) {
        return false;
      }

      // Category filter (using wordpress_category_id from components table)
      if (selectedCategory) {
        // We need to match against the wordpress category
        const componentCategoryId = component.wordpress_category_id?.toString();
        if (!componentCategoryId || componentCategoryId !== selectedCategory) {
          return false;
        }
      }

      return true;
    });
  }, [components, searchTerm, selectedCategory, selectedSite]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSite(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSite,
    setSelectedSite,
    filteredComponents,
    handleClearFilters,
  };
};
