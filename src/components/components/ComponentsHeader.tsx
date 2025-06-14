
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Settings2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/features/auth';
import type { Component } from '@/core/types';

interface ComponentsHeaderProps {
  filteredCount: number;
  totalCount: number;
  components?: Component[];
}

const ComponentsHeader: React.FC<ComponentsHeaderProps> = ({
  filteredCount,
  totalCount,
}) => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Componentes Superelements ({filteredCount}/{totalCount})
          </h1>
          
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            <ExternalLink className="h-3 w-3 mr-1" />
            Biblioteca Superelements
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm">
          Biblioteca completa de componentes Elementor do Superelements
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {isAdmin && (
          <Button asChild variant="secondary" size="sm">
            <Link to="/admin/components" className="flex items-center">
              <Settings2 className="mr-2 h-4 w-4" />
              Gerenciar
            </Link>
          </Button>
        )}
        {user && (
          <Button asChild size="sm">
            <Link to="/components/new" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Componente
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ComponentsHeader;
