import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings2 } from 'lucide-react';
import { useAuth } from '@/features/auth';

interface ComponentsHeaderProps {
  filteredCount: number;
  totalCount: number;
}

const ComponentsHeader: React.FC<ComponentsHeaderProps> = ({
  filteredCount,
  totalCount
}) => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Componentes ({filteredCount}/{totalCount})
        </h1>
        <p className="text-muted-foreground text-sm">
          Explore os componentes disponíveis para Elementor
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
