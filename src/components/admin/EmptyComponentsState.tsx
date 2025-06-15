
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Filter, PlusCircle } from 'lucide-react';

const EmptyComponentsState = () => {
  return (
    <div className="text-center py-8">
      <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No components found</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        We couldn't find components with the applied filters. Try another search or create a new component.
      </p>
      <Button asChild>
        <Link to="/components/new">
          <PlusCircle className="h-4 w-4 mr-1" />
          Create Component
        </Link>
      </Button>
    </div>
  );
};

export default EmptyComponentsState;
