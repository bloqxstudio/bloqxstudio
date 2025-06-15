
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building, Globe } from 'lucide-react';
import type { Component } from '@/core/types';

interface ComponentsHeaderProps {
  filteredCount: number;
  totalCount: number;
  components?: Component[];
}

const ComponentsHeader: React.FC<ComponentsHeaderProps> = ({
  filteredCount,
  totalCount,
  components = [],
}) => {
  // Calcular estatísticas por fonte
  const sourceStats = React.useMemo(() => {
    const stats = {
      wordpress: 0,
      sites: new Set<string>()
    };

    components.forEach(component => {
      if (component.source === 'wordpress') {
        stats.wordpress++;
        if (component.source_site) {
          stats.sites.add(component.source_site);
        }
      }
    });

    return {
      ...stats,
      totalSites: stats.sites.size
    };
  }, [components]);

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Biblioteca de Componentes ({filteredCount}/{totalCount})
          </h1>
          
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <Globe className="h-3 w-3 mr-1" />
            WordPress
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-2">
          {sourceStats.wordpress > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <Building className="h-3 w-3 mr-1" />
              Sites WordPress: {sourceStats.wordpress} ({sourceStats.totalSites} sites)
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm">
          Acesse componentes de todos os seus sites WordPress conectados em um só lugar
        </p>
      </div>
    </div>
  );
};

export default ComponentsHeader;
