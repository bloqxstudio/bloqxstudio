import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import SelectedComponentsSidebar from './SelectedComponentsSidebar';
import { useAuth } from '@/features/auth';

const SelectionFloatingButton = () => {
  const { selectedComponents } = useSelectedComponents();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed z-50 bottom-6 right-6 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/80 transition-colors flex items-center justify-center p-3"
      >
        <Package className="h-6 w-6" />
        {selectedComponents.length > 0 && (
          <Badge className="absolute top-1 right-1 rounded-full px-2 py-0 text-xs">
            {selectedComponents.length}
          </Badge>
        )}
      </button>

      <SelectedComponentsSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </>
  );
};

export default SelectionFloatingButton;
