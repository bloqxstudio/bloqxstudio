
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
  components = []
}) => {
  // Calculate statistics by source
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
  return <div className="flex justify-between items-center mb-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Component Library ({filteredCount}/{totalCount})
          </h1>
          
          
        </div>
        
        
        
        <p className="text-muted-foreground text-sm">
          Access components from all your connected WordPress sites in one place
        </p>
      </div>
    </div>;
};
export default ComponentsHeader;
