
import React from 'react';
import ComponentsWithCategories, { ComponentsFiltersBarWrapper } from '@/components/components/ComponentsWithCategories';
import FullscreenPageWrapper from '@/components/layout/FullscreenPageWrapper';

const Components = () => {
  return (
    <FullscreenPageWrapper 
      showFilters={true}
      filtersContent={<ComponentsFiltersBarWrapper />}
    >
      <ComponentsWithCategories />
    </FullscreenPageWrapper>
  );
};

export default Components;
