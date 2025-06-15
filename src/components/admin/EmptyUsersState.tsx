
import React from 'react';
import { Search } from 'lucide-react';

const EmptyUsersState = () => {
  return (
    <div className="text-center py-8">
      <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No users found</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        We couldn't find users with the applied search term. Try another term.
      </p>
    </div>
  );
};

export default EmptyUsersState;
