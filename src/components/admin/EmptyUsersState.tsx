
import React from 'react';
import { Search } from 'lucide-react';

const EmptyUsersState = () => {
  return (
    <div className="text-center py-8">
      <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        Não encontramos usuários com o termo de busca aplicado. Tente outro termo.
      </p>
    </div>
  );
};

export default EmptyUsersState;
