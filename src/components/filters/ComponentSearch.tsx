
import React from 'react';
import { Input } from '@/components/ui';
import { Search, X } from 'lucide-react';

interface ComponentSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onClearSearch: () => void;
  placeholder?: string;
}

const ComponentSearch: React.FC<ComponentSearchProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  onClearSearch,
  placeholder = "Search components..."
}) => {
  return (
    <div className="relative mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 transition-all ${searchTerm ? 'border-primary ring-1 ring-primary/20' : ''}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {searchTerm && (
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={onClearSearch}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ComponentSearch;
