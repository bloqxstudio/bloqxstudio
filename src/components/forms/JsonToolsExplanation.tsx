
import React from 'react';
import { AlertCircle, Wand2, Paintbrush } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';

const JsonToolsExplanation: React.FC = () => {
  return (
    <Alert variant="info" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Como usar a ferramenta JSON</AlertTitle>
      <AlertDescription>
        <p className="mb-2">Nossa ferramenta de processamento JSON tem as seguintes funcionalidades:</p>
        
        <div className="space-y-2 mt-3">
          <div className="flex items-start gap-2">
            <Wand2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Processar JSON</p>
              <p className="text-sm text-muted-foreground">Limpa, valida e formata o JSON para melhor legibilidade e compatibilidade com o sistema.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Paintbrush className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Estilo Wireframe</p>
              <p className="text-sm text-muted-foreground">Aplica estilo de wireframe limpo em preto, branco e azul, mantendo a estrutura original do componente com visual profissional.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-2 border-t border-blue-100 dark:border-blue-800">
          <p className="text-sm">
            <strong>Dica:</strong> Utilize o botão "Ver exemplo de wireframe" para visualizar como o componente ficará após aplicar o estilo wireframe. A estrutura é preservada, mas com uma estética limpa profissional.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default JsonToolsExplanation;
