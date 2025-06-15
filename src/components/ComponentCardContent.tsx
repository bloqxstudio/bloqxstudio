
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { Component } from '@/core/types';

interface ComponentCardContentProps {
  component: Component;
}

const ComponentCardContent: React.FC<ComponentCardContentProps> = ({ component }) => {
  const getSourceBadge = () => {
    if (component.source === 'wordpress' && component.source_site) {
      return (
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
          <Edit className="h-3 w-3 mr-1" />
          {component.source_site}
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors flex-1">
          {component.title}
        </h3>
        {getSourceBadge()}
      </div>

      {component.slug && (
        <div className="mb-2">
          <Badge variant="outline" className="text-xs">
            /{component.slug}
          </Badge>
        </div>
      )}
      
      {component.tags && component.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {component.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {component.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{component.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ComponentCardContent;
