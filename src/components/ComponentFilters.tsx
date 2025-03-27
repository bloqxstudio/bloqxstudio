
import React from 'react';
import { 
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Badge
} from '@/components/ui';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Columns2,
  Columns3,
  Image,
  Heading,
  List,
  Video,
  SquareX,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlignmentType = 'left' | 'center' | 'right' | 'full';
export type ColumnsType = '1' | '2' | '3+';
export type ElementType = 'image' | 'heading' | 'button' | 'list' | 'video';

interface ComponentFiltersProps {
  selectedAlignments: AlignmentType[];
  selectedColumns: ColumnsType[];
  selectedElements: ElementType[];
  onAlignmentChange: (alignment: AlignmentType) => void;
  onColumnsChange: (columns: ColumnsType) => void;
  onElementChange: (element: ElementType) => void;
  onClearFilter: (filterType: 'alignment' | 'columns' | 'element') => void;
  filteredCount: number;
  totalCount: number;
}

const ComponentFilters: React.FC<ComponentFiltersProps> = ({
  selectedAlignments,
  selectedColumns,
  selectedElements,
  onAlignmentChange,
  onColumnsChange,
  onElementChange,
  onClearFilter,
  filteredCount,
  totalCount
}) => {
  // Get icon for alignment
  const getAlignmentIcon = (type: AlignmentType) => {
    switch(type) {
      case 'left': return <AlignLeft className="h-4 w-4" />;
      case 'center': return <AlignCenter className="h-4 w-4" />;
      case 'right': return <AlignRight className="h-4 w-4" />;
      case 'full': return <AlignJustify className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Alignment Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn(
                "gap-2",
                selectedAlignments.length > 0 && "border-primary bg-primary/10 text-primary font-medium"
              )}>
                <AlignLeft className="h-4 w-4" />
                Alignment
                {selectedAlignments.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary hover:bg-primary/20">
                    {selectedAlignments.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              <DropdownMenuItem onClick={() => onAlignmentChange('left')} className="gap-2">
                <AlignLeft className="h-4 w-4" /> Left
                {selectedAlignments.includes('left') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlignmentChange('center')} className="gap-2">
                <AlignCenter className="h-4 w-4" /> Center
                {selectedAlignments.includes('center') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlignmentChange('right')} className="gap-2">
                <AlignRight className="h-4 w-4" /> Right
                {selectedAlignments.includes('right') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAlignmentChange('full')} className="gap-2">
                <AlignJustify className="h-4 w-4" /> Full
                {selectedAlignments.includes('full') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onClearFilter('alignment')} 
                className="text-muted-foreground"
                disabled={selectedAlignments.length === 0}
              >
                Clear filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Columns Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn(
                "gap-2",
                selectedColumns.length > 0 && "border-primary bg-primary/10 text-primary font-medium"
              )}>
                <Columns2 className="h-4 w-4" />
                Columns
                {selectedColumns.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary hover:bg-primary/20">
                    {selectedColumns.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              <DropdownMenuItem onClick={() => onColumnsChange('1')} className="gap-2">
                1 Column
                {selectedColumns.includes('1') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColumnsChange('2')} className="gap-2">
                <Columns2 className="h-4 w-4" /> 2 Columns
                {selectedColumns.includes('2') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColumnsChange('3+')} className="gap-2">
                <Columns3 className="h-4 w-4" /> 3+ Columns
                {selectedColumns.includes('3+') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onClearFilter('columns')} 
                className="text-muted-foreground"
                disabled={selectedColumns.length === 0}
              >
                Clear filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Elements Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn(
                "gap-2",
                selectedElements.length > 0 && "border-primary bg-primary/10 text-primary font-medium"
              )}>
                {selectedElements.length > 0 ? (
                  <>
                    {selectedElements.length > 1 
                      ? "Elements" 
                      : getElementIcon(selectedElements[0])}
                    <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary hover:bg-primary/20">
                      {selectedElements.length}
                    </Badge>
                  </>
                ) : "Elements"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              <DropdownMenuItem onClick={() => onElementChange('image')} className="gap-2">
                <Image className="h-4 w-4" /> Image
                {selectedElements.includes('image') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onElementChange('heading')} className="gap-2">
                <Heading className="h-4 w-4" /> Heading
                {selectedElements.includes('heading') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onElementChange('button')} className="gap-2">
                Button
                {selectedElements.includes('button') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onElementChange('list')} className="gap-2">
                <List className="h-4 w-4" /> List
                {selectedElements.includes('list') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onElementChange('video')} className="gap-2">
                <Video className="h-4 w-4" /> Video
                {selectedElements.includes('video') && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onClearFilter('element')} 
                className="text-muted-foreground"
                disabled={selectedElements.length === 0}
              >
                Clear filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Component Counter */}
        <div className="text-sm text-muted-foreground">
          <Badge variant="outline" className="rounded-md font-normal">
            {filteredCount} of {totalCount} components
          </Badge>
        </div>
      </div>
      
      {/* Active Filters - Updated with better visual appearance */}
      {(selectedAlignments.length > 0 || selectedColumns.length > 0 || selectedElements.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center mt-3 pt-3 border-t">
          <span className="text-sm text-muted-foreground mr-1">Active filters:</span>
          
          {selectedAlignments.map(alignment => (
            <Badge 
              key={`alignment-${alignment}`} 
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary border-primary/30"
            >
              {getAlignmentIcon(alignment)}
              {capitalizeFirstLetter(alignment)}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 p-0 hover:bg-transparent" 
                onClick={() => onAlignmentChange(alignment)}
              >
                <SquareX className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {selectedColumns.map(columns => (
            <Badge 
              key={`columns-${columns}`} 
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary border-primary/30"
            >
              {columns === '2' ? <Columns2 className="h-4 w-4" /> : 
               columns === '3+' ? <Columns3 className="h-4 w-4" /> : null}
              {columns === '1' ? '1 Column' : columns === '2' ? '2 Columns' : '3+ Columns'}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 p-0 hover:bg-transparent" 
                onClick={() => onColumnsChange(columns)}
              >
                <SquareX className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {selectedElements.map(element => (
            <Badge 
              key={`element-${element}`} 
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary border-primary/30"
            >
              {getElementIcon(element)}
              {capitalizeFirstLetter(element)}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 p-0 hover:bg-transparent" 
                onClick={() => onElementChange(element)}
              >
                <SquareX className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {(selectedAlignments.length > 0 || selectedColumns.length > 0 || selectedElements.length > 0) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs ml-2 h-7"
              onClick={() => {
                onClearFilter('alignment');
                onClearFilter('columns');
                onClearFilter('element');
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get element icon
function getElementIcon(element: ElementType) {
  switch(element) {
    case 'image': return <Image className="h-4 w-4" />;
    case 'heading': return <Heading className="h-4 w-4" />;
    case 'button': return <span className="text-xs bg-muted rounded-full px-1">btn</span>;
    case 'list': return <List className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
  }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default ComponentFilters;
