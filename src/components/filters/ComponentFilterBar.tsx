
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { 
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import ComponentFilters from '@/components/ComponentFilters';
import { AlignmentType, ColumnsType, ElementType } from '@/components/ComponentFilters';

interface ComponentFilterBarProps {
  selectedAlignments: AlignmentType[];
  selectedColumns: ColumnsType[];
  selectedElements: ElementType[];
  onAlignmentChange: (alignment: AlignmentType) => void;
  onColumnsChange: (columns: ColumnsType) => void;
  onElementChange: (element: ElementType) => void;
  onClearFilter: (filterType: 'alignment' | 'columns' | 'element') => void;
  filteredCount: number;
  totalCount: number;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (open: boolean) => void;
}

const ComponentFilterBar: React.FC<ComponentFilterBarProps> = ({
  selectedAlignments,
  selectedColumns,
  selectedElements,
  onAlignmentChange,
  onColumnsChange,
  onElementChange,
  onClearFilter,
  filteredCount,
  totalCount,
  mobileFiltersOpen,
  setMobileFiltersOpen
}) => {
  return (
    <>
      {/* Mobile Filters Collapsible */}
      <Collapsible 
        open={mobileFiltersOpen} 
        onOpenChange={setMobileFiltersOpen}
        className="md:hidden mb-4"
      >
        <CollapsibleContent>
          <Card className="mb-4">
            <CardContent className="pt-4">
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
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Desktop Filters */}
      <div className="hidden md:block mb-6">
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
      </div>
    </>
  );
};

export default ComponentFilterBar;
