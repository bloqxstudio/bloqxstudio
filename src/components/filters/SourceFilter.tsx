
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Building } from 'lucide-react';

interface SourceFilterProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
  availableSources: Array<{
    id: string;
    name: string;
    type: 'wordpress';
    count: number;
  }>;
}

const SourceFilter: React.FC<SourceFilterProps> = ({
  selectedSource,
  onSourceChange,
  availableSources,
}) => {
  const getSourceIcon = (type: 'wordpress') => {
    return <Building className="h-3 w-3" />;
  };

  const getSourceBadgeColor = (type: 'wordpress') => {
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">
        Site:
      </label>
      
      <Select value={selectedSource} onValueChange={onSourceChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select site" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>All sites</span>
              <Badge variant="secondary" className="ml-2">
                {availableSources.reduce((sum, source) => sum + source.count, 0)}
              </Badge>
            </div>
          </SelectItem>
          
          {availableSources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              <div className="flex items-center gap-2">
                {getSourceIcon(source.type)}
                <span>{source.name}</span>
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${getSourceBadgeColor(source.type)}`}
                >
                  {source.count}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SourceFilter;
