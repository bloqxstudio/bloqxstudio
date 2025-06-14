
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Settings2, ExternalLink, Database } from 'lucide-react';
import { useAuth } from '@/features/auth';

interface ComponentsHeaderProps {
  filteredCount: number;
  totalCount: number;
  components?: Array<{ source?: 'local' | 'wordpress' }>;
}

const ComponentsHeader: React.FC<ComponentsHeaderProps> = ({
  filteredCount,
  totalCount,
  components = []
}) => {
  const { user, isAdmin } = useAuth();

  // Contar componentes por origem
  const localCount = components.filter(c => c.source === 'local').length;
  const wordpressCount = components.filter(c => c.source === 'wordpress').length;

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Componentes ({filteredCount}/{totalCount})
          </h1>
          
          {/* Badges de origem */}
          <div className="flex gap-2">
            {localCount > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <Database className="h-3 w-3 mr-1" />
                {localCount} Locais
              </Badge>
            )}
            {wordpressCount > 0 && (
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                <ExternalLink className="h-3 w-3 mr-1" />
                {wordpressCount} Superelements
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm">
          Biblioteca unificada com componentes locais e Superelements
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
