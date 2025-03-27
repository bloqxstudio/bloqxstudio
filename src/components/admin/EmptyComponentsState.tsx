
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Filter, PlusCircle } from 'lucide-react';

const EmptyComponentsState = () => {
  return (
    <div className="text-center py-8">
      <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Nenhum componente encontrado</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        Não encontramos componentes com os filtros aplicados. Tente outra busca ou crie um novo componente.
      </p>
      <Button asChild>
        <Link to="/components/new">
          <PlusCircle className="h-4 w-4 mr-1" />
          Criar Componente
        </Link>
      </Button>
    </div>
  );
};

export default EmptyComponentsState;
