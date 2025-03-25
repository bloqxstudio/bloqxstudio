
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ComponentCard from '@/components/ComponentCard';
import { 
  getSampleComponents, 
  getSampleCategories, 
  getSampleComponentsByCategory 
} from '@/lib/data';
import { 
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { FilterX, SlidersHorizontal } from 'lucide-react';

const Components = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [components, setComponents] = useState(getSampleComponents());
  const categories = getSampleCategories();
  const [activeFilter, setActiveFilter] = useState<string | null>(categoryFilter);
  const [sort, setSort] = useState<string>('newest');

  useEffect(() => {
    let filteredComponents = categoryFilter 
      ? getSampleComponentsByCategory(categoryFilter) 
      : getSampleComponents();
    
    // Apply sorting
    if (sort === 'newest') {
      filteredComponents = [...filteredComponents].sort(
        (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
    } else if (sort === 'oldest') {
      filteredComponents = [...filteredComponents].sort(
        (a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
      );
    } else if (sort === 'a-z') {
      filteredComponents = [...filteredComponents].sort(
        (a, b) => a.title.localeCompare(b.title)
      );
    } else if (sort === 'z-a') {
      filteredComponents = [...filteredComponents].sort(
        (a, b) => b.title.localeCompare(a.title)
      );
    }
    
    setComponents(filteredComponents);
    setActiveFilter(categoryFilter);
  }, [categoryFilter, sort]);

  const handleFilterChange = (categoryId: string) => {
    if (categoryId === activeFilter) {
      // Clear filter
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      // Apply filter
      searchParams.set('category', categoryId);
      setSearchParams(searchParams);
    }
  };

  const clearFilters = () => {
    searchParams.delete('category');
    setSearchParams(searchParams);
    setActiveFilter(null);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">Componentes</h1>
              <p className="text-muted-foreground mt-1">
                Encontre e gerencie seus componentes Elementor
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground hidden md:inline">Ordenar por:</span>
              </div>
              <Select defaultValue={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="a-z">A-Z</SelectItem>
                  <SelectItem value="z-a">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeFilter === category.id ? "default" : "outline"}
                  size="sm"
                  className="mb-2"
                  onClick={() => handleFilterChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
              {activeFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2 text-muted-foreground"
                  onClick={clearFilters}
                >
                  <FilterX className="h-4 w-4 mr-1" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          {components.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum componente encontrado com os filtros atuais.</p>
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
              {components.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Components;
