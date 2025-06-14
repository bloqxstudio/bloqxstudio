
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Filter } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import WordPressComponentGrid from '@/components/wordpress/WordPressComponentGrid';
import { getWordPressCategories } from '@/core/api/wordpress';

const SuperelementsComponents = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['wordpress-categories'],
    queryFn: getWordPressCategories,
  });

  const categories = categoriesResponse?.data || [];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Componentes Superelements</h1>
          <p className="text-muted-foreground text-lg">
            Biblioteca completa de componentes premium para Elementor
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Search className="h-4 w-4 inline mr-1" />
                  Buscar componentes
                </label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome do componente..."
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoria
                </label>
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center h-10">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            {(searchTerm || selectedCategory) && (
              <div className="mt-4 flex gap-2">
                {searchTerm && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    Busca: "{searchTerm}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    Categoria: {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grid de Componentes */}
        <WordPressComponentGrid 
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
        />
      </div>
    </PageWrapper>
  );
};

export default SuperelementsComponents;
