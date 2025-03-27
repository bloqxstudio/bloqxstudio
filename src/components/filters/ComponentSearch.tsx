
import React from 'react';

interface ComponentSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ComponentSearch: React.FC<ComponentSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative mb-8">
      <input
        type="search"
        placeholder="Buscar componentes por título, descrição ou tags..."
        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default ComponentSearch;
