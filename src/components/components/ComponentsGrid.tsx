
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
  // Log for debugging
  console.log('🎯 ComponentsGrid rendering:', {
    totalComponents: components.length,
    filteredComponents: filteredComponents.length,
    isLoading,
    hasError: !!error
  });

  // Detailed component log
  if (filteredComponents.length > 0) {
    console.log('📋 First 5 filtered components:');
    filteredComponents.slice(0, 5).forEach((comp, i) => {
      console.log(`  ${i + 1}. ${comp.title} (${comp.source}) - Image: ${comp.preview_image ? 'YES' : 'NO'}`);
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading Superelements components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error in ComponentsGrid:', error);
    return (
      <Card className="border-dashed border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <Filter className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error loading components</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            There was a problem fetching components from Superelements. Check your connection and try again.
          </p>
          <Button onClick={handleRetry} variant="outline">
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredComponents.length === 0) {
    console.log('📭 No components found after filters');
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Filter className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No components found</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            We couldn't find any Superelements components with the applied filters. Try adjusting your search.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log(`🎨 Rendering grid with ${filteredComponents.length} components`);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredComponents.map((component, index) => {
        console.log(`🔧 Rendering card ${index + 1}:`, {
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
