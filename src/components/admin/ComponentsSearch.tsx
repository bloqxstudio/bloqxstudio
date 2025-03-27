
import React from 'react';

interface ComponentsSearchProps {
  filter: string;
  setFilter: (value: string) => void;
}

const ComponentsSearch = ({ filter, setFilter }: ComponentsSearchProps) => {
  return (
    <div className="relative mb-8">
      <input
        type="search"
        placeholder="Buscar componentes por título, descrição ou categoria..."
        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
    </div>
  );
};

export default ComponentsSearch;
