
import React from 'react';
import { Component } from '@/core/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import ComponentCard from '@/components/ComponentCard';

interface ComponentsGridProps {
  components: Component[];
  filteredComponents: Component[];
  isLoading: boolean;
  error: unknown;
  handleRetry: () => void;
  user?: any; // Optional now
}

const ComponentsGrid: React.FC<ComponentsGridProps> = ({
  components,
  filteredComponents,
  isLoading,
  error,
  handleRetry
}) => {
  // Log para debug
  console.log('🎯 ComponentsGrid renderizando:', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    isLoading,
    hasError: !!error
  });

  // Log detalhado dos componentes
  if (filteredComponents.length > 0) {
    console.log('📋 Primeiros 5 componentes filtrados:');
    filteredComponents.slice(0, 5).forEach((comp, i) => {
      console.log(`  ${i + 1}. ${comp.title} (${comp.source}) - Imagem: ${comp.preview_image ? 'SIM' : 'NÃO'}`);
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando componentes Superelements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Erro no ComponentsGrid:', error);
    return (
      <Card className="border-dashed border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <Filter className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar componentes</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Ocorreu um problema ao buscar os componentes do Superelements. Verifique sua conexão e tente novamente.
          </p>
          <Button onClick={handleRetry} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredComponents.length === 0) {
    console.log('📭 Nenhum componente encontrado após filtros');
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Filter className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum componente encontrado</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Não encontramos nenhum componente Superelements com os filtros aplicados. Tente ajustar sua busca.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log(`🎨 Renderizando grid com ${filteredComponents.length} componentes`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredComponents.map((component, index) => {
        console.log(`🔧 Renderizando card ${index + 1}:`, {
          id: component.id,
          title: component.title,
          source: component.source,
          preview_image: component.preview_image
        });
        
        return (
          <ComponentCard key={component.id} component={component} />
        );
      })}
    </div>
  );
};

export default ComponentsGrid;
