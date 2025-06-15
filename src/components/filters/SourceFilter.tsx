
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, Building } from 'lucide-react';

interface SourceFilterProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
  availableSources: Array<{
    id: string;
    name: string;
    type: 'superelements' | 'wordpress';
    count: number;
  }>;
}

const SourceFilter: React.FC<SourceFilterProps> = ({
  selectedSource,
  onSourceChange,
  availableSources,
}) => {
  const getSourceIcon = (type: 'superelements' | 'wordpress') => {
    switch (type) {
      case 'superelements':
        return <ExternalLink className="h-3 w-3" />;
      case 'wordpress':
        return <Building className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const getSourceBadgeColor = (type: 'superelements' | 'wordpress') => {
    switch (type) {
      case 'superelements':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'wordpress':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">
        Fonte:
      </label>
      
      <Select value={selectedSource} onValueChange={onSourceChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione a fonte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Todos os sites</span>
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
