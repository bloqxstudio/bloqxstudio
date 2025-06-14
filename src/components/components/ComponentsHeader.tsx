
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import type { Component } from '@/core/types';

interface ComponentsHeaderProps {
  filteredCount: number;
  totalCount: number;
  components?: Component[];
}

const ComponentsHeader: React.FC<ComponentsHeaderProps> = ({
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Componentes Superelements ({filteredCount}/{totalCount})
          </h1>
          
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            <ExternalLink className="h-3 w-3 mr-1" />
            Biblioteca Pública
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm">
          Biblioteca completa de componentes Elementor do Superelements - Acesso gratuito para todos
        </p>
      </div>
    </div>
  );
};

export default ComponentsHeader;
