
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui';

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const UserSearch = ({ searchTerm, onSearchChange }: UserSearchProps) => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por email..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10"
      />
    </div>
  );
};

export default UserSearch;
