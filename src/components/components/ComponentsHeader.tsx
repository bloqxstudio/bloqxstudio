
import React from 'react';
import type { Component } from '@/core/types';

interface ComponentsHeaderProps {
  filteredCount: number;
  totalCount: number;
  components?: Component[];
}

const ComponentsHeader: React.FC<ComponentsHeaderProps> = ({
  filteredCount,
  totalCount,
  components = []
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Component Library
          </h1>
        </div>
        
        <p className="text-muted-foreground text-sm">
          Access components from all your connected WordPress sites in one place
        </p>
      </div>
    </div>
  );
};

export default ComponentsHeader;
