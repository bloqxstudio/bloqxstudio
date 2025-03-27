
import React from 'react';
import { 
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
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
  Video 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AlignmentType = 'left' | 'center' | 'right' | 'full' | null;
type ColumnsType = '1' | '2' | '3+' | null;
type ElementType = 'image' | 'heading' | 'button' | 'list' | 'video' | null;

interface ComponentFiltersProps {
  selectedAlignment: AlignmentType;
  selectedColumns: ColumnsType;
  selectedElement: ElementType;
  onAlignmentChange: (alignment: AlignmentType) => void;
  onColumnsChange: (columns: ColumnsType) => void;
  onElementChange: (element: ElementType) => void;
}

const ComponentFilters: React.FC<ComponentFiltersProps> = ({
  selectedAlignment,
  selectedColumns,
  selectedElement,
  onAlignmentChange,
  onColumnsChange,
  onElementChange
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* Alignment Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "gap-2",
            selectedAlignment && "border-primary text-primary"
          )}>
            {selectedAlignment === 'left' && <AlignLeft className="h-4 w-4" />}
            {selectedAlignment === 'center' && <AlignCenter className="h-4 w-4" />}
            {selectedAlignment === 'right' && <AlignRight className="h-4 w-4" />}
            {selectedAlignment === 'full' && <AlignJustify className="h-4 w-4" />}
            {!selectedAlignment && <AlignLeft className="h-4 w-4" />}
            Alignment
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onAlignmentChange('left')} className="gap-2">
            <AlignLeft className="h-4 w-4" /> Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAlignmentChange('center')} className="gap-2">
            <AlignCenter className="h-4 w-4" /> Center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAlignmentChange('right')} className="gap-2">
            <AlignRight className="h-4 w-4" /> Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAlignmentChange('full')} className="gap-2">
            <AlignJustify className="h-4 w-4" /> Full
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAlignmentChange(null)} className="text-muted-foreground">
            Clear filter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Columns Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "gap-2",
            selectedColumns && "border-primary text-primary"
          )}>
            {selectedColumns === '1' && "1"}
            {selectedColumns === '2' && <Columns2 className="h-4 w-4" />}
            {selectedColumns === '3+' && <Columns3 className="h-4 w-4" />}
            {!selectedColumns && <Columns2 className="h-4 w-4" />}
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onColumnsChange('1')} className="gap-2">
            1 Column
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onColumnsChange('2')} className="gap-2">
            <Columns2 className="h-4 w-4" /> 2 Columns
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onColumnsChange('3+')} className="gap-2">
            <Columns3 className="h-4 w-4" /> 3+ Columns
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onColumnsChange(null)} className="text-muted-foreground">
            Clear filter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Elements Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "gap-2",
            selectedElement && "border-primary text-primary"
          )}>
            {selectedElement === 'image' && <Image className="h-4 w-4" />}
            {selectedElement === 'heading' && <Heading className="h-4 w-4" />}
            {selectedElement === 'button' && "Button"}
            {selectedElement === 'list' && <List className="h-4 w-4" />}
            {selectedElement === 'video' && <Video className="h-4 w-4" />}
            {!selectedElement && "Elements"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onElementChange('image')} className="gap-2">
            <Image className="h-4 w-4" /> Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onElementChange('heading')} className="gap-2">
            <Heading className="h-4 w-4" /> Heading
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onElementChange('button')} className="gap-2">
            Button
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onElementChange('list')} className="gap-2">
            <List className="h-4 w-4" /> List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onElementChange('video')} className="gap-2">
            <Video className="h-4 w-4" /> Video
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onElementChange(null)} className="text-muted-foreground">
            Clear filter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ComponentFilters;
