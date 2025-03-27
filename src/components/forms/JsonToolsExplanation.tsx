
import React from 'react';
import { AlertCircle, Wand2, Eye, Paintbrush, ChevronsUpDown } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';

const JsonToolsExplanation: React.FC = () => {
  return (
    <Alert variant="info" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Ferramentas de JSON</AlertTitle>
      <AlertDescription>
        <p className="mb-2">Nossas ferramentas de edição JSON fornecem as seguintes funcionalidades:</p>
        
        <div className="space-y-2 mt-3">
          <div className="flex items-start gap-2">
            <Wand2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Limpar JSON</p>
              <p className="text-sm text-muted-foreground">Remove propriedades desnecessárias e formata o JSON para melhor legibilidade.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Pré-visualizar</p>
              <p className="text-sm text-muted-foreground">Mostra o JSON formatado para facilitar a leitura e verificação.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Paintbrush className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Estilo Wireframe</p>
              <p className="text-sm text-muted-foreground">Aplica estilo wireframe premium ao JSON com nomenclatura Client-First.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <ChevronsUpDown className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Wireframe Completo</p>
              <p className="text-sm text-muted-foreground">Substitui textos por placeholders em português, imagens por placeholders, e aplica nomenclatura Client-First.</p>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default JsonToolsExplanation;
