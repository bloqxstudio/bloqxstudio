
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui';
import ComponentBreadcrumb from '@/components/ComponentBreadcrumb';
import { useAuth } from '@/context/AuthContext';

interface ComponentsHeaderProps {
  handleCreateClick: () => void;
}

const ComponentsHeader: React.FC<ComponentsHeaderProps> = ({ handleCreateClick }) => {
  const { user, isAdmin } = useAuth();
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
      </div>
      
      <div className="flex items-center gap-2">
        {user && (
          <Button onClick={handleCreateClick} className="hover-lift" size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            Novo Componente
          </Button>
        )}
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
