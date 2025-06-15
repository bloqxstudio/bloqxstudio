
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import { SidebarHeader as UISidebarHeader } from '@/components/ui/sidebar';

interface SidebarHeaderProps {
  onSync: () => void;
  sitesCount: number;
}

export function SidebarHeader({ onSync, sitesCount }: SidebarHeaderProps) {
  return (
    <UISidebarHeader className="border-b">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtros</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          disabled={sitesCount === 0}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </UISidebarHeader>
  );
}
