
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useSelectedComponents } from '@/context/SelectedComponentsContext';
import SelectedComponentsSidebar from './SelectedComponentsSidebar';

const SelectionFloatingButton: React.FC = () => {
  const { totalSelected } = useSelectedComponents();

  if (totalSelected === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 shadow-lg animate-fade-in">
      <SelectedComponentsSidebar 
        trigger={
          <Button 
            size="lg" 
            className="rounded-full h-14 pr-6 bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span className="mr-1">Ver selecionados</span>
            <Badge 
              className="bg-white text-green-700 ml-1"
              variant="secondary"
            >
              {totalSelected}
            </Badge>
          </Button>
        }
      />
    </div>
  );
};

export default SelectionFloatingButton;
