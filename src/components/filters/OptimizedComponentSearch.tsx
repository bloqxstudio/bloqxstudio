
import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

interface OptimizedComponentSearchProps {
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

export const OptimizedComponentSearch: React.FC<OptimizedComponentSearchProps> = ({
  onSearchChange,
  placeholder = "Buscar componentes...",
  className = ""
}) => {
  const [searchInput, setSearchInput] = useState('');
  
  // Debounce search para evitar muitas chamadas
  const debouncedSearch = useDebounce(searchInput, 200); // 200ms debounce
  
  // Chamar onSearchChange quando debounced value mudar
  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  const hasSearch = searchInput.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchInput}
          onChange={handleInputChange}
          className="pl-10 pr-10"
        />
        {hasSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {debouncedSearch && (
        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-b-md shadow-sm z-10 p-2">
          <span className="text-xs text-muted-foreground">
            Buscando por: "{debouncedSearch}"
          </span>
        </div>
      )}
    </div>
  );
};
