
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui';
import ComponentBreadcrumb from '@/components/ComponentBreadcrumb';
import { useAuth } from '@/context/AuthContext';

const ComponentsHeader: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div>
        <ComponentBreadcrumb
          title="All Components"
        />
        <h1 className="text-3xl font-bold tracking-tighter">
          Components
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore nosso catálogo de blocos e componentes para seus projetos
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="gap-1"
          >
            <Settings className="h-4 w-4" />
            Painel de Controle
          </Button>
        )}
      </div>
    </div>
  );
};

export default ComponentsHeader;
