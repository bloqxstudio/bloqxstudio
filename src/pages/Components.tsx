
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getComponents } from '@/lib/api';
import { toast } from 'sonner';
import { Filter } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { SelectedComponentsProvider } from '@/context/SelectedComponentsContext';

// Import our components and hook
import ComponentsHeader from '@/components/components/ComponentsHeader';
import ComponentFilterBar from '@/components/filters/ComponentFilterBar';
import ComponentSearch from '@/components/filters/ComponentSearch';
import ComponentsGrid from '@/components/components/ComponentsGrid';
import { useComponentFilters } from '@/hooks/useComponentFilters';
import SelectedComponentsSidebar from '@/components/selection/SelectedComponentsSidebar';

const Components = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch components from Supabase
  const { data: components = [], isLoading, error, refetch } = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
    staleTime: 30 * 1000,
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000),
  });

  // Use our custom hook for filter functionality
  const {
    searchTerm,
    setSearchTerm,
    selectedAlignments,
    selectedColumns,
    selectedElements,
    handleAlignmentChange,
    handleColumnsChange,
    handleElementChange,
    handleClearFilter,
    filteredComponents,
    mobileFiltersOpen,
    setMobileFiltersOpen
  } = useComponentFilters(components);

  // Get total active filters count
  const totalActiveFilters = selectedAlignments.length + selectedColumns.length + selectedElements.length;

  // Show error if data fetching fails
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar componentes:', error);
      toast.error('Erro ao carregar componentes. Tentando novamente...');
      
      // Auto retry after delay
      const timer = setTimeout(() => {
        refetch();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, refetch]);
  
  // Handle create button click
  const handleCreateClick = () => {
    navigate('/components/new');
  };

  // Retry button handler
  const handleRetry = () => {
    toast.info('Recarregando componentes...');
    refetch();
  };

  return (
    <SelectedComponentsProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <ComponentsHeader handleCreateClick={handleCreateClick} />
            <div className="flex items-center gap-2">
              <SelectedComponentsSidebar />
            </div>
          </div>
          
          {/* Mobile filter toggle button - Enhanced with filter count */}
          <div className="flex md:hidden mb-4">
            <Button 
              variant={totalActiveFilters > 0 ? "default" : "outline"}
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full flex items-center justify-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros {mobileFiltersOpen ? '▲' : '▼'}
              {totalActiveFilters > 0 && (
                <Badge className="ml-2 bg-background/90 text-primary hover:bg-background/90">
                  {totalActiveFilters}
                </Badge>
              )}
            </Button>
          </div>
          
          <ComponentFilterBar
            selectedAlignments={selectedAlignments}
            selectedColumns={selectedColumns}
            selectedElements={selectedElements}
            onAlignmentChange={handleAlignmentChange}
            onColumnsChange={handleColumnsChange}
            onElementChange={handleElementChange}
            onClearFilter={handleClearFilter}
            filteredCount={filteredComponents.length}
            totalCount={components.length}
            mobileFiltersOpen={mobileFiltersOpen}
            setMobileFiltersOpen={setMobileFiltersOpen}
          />
          
          <ComponentSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <ComponentsGrid
            components={components}
            filteredComponents={filteredComponents}
            isLoading={isLoading}
            error={error}
            handleRetry={handleRetry}
            handleCreateClick={handleCreateClick}
            user={user}
          />
        </main>
        
        <footer className="border-t py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </SelectedComponentsProvider>
  );
};

export default Components;
