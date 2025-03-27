
import React from 'react';
import { Input } from '@/components/ui';
import { Search } from 'lucide-react';

interface ComponentSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ComponentSearch: React.FC<ComponentSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar componentes por título, descrição ou tags..."
          className={`w-full pl-10 pr-4 transition-all ${searchTerm ? 'border-primary ring-1 ring-primary/20' : ''}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {searchTerm && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <button 
            className="text-muted-foreground hover:text-foreground text-xs"
            onClick={() => setSearchTerm('')}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default ComponentSearch;
