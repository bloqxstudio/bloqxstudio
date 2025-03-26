
import React from 'react';
import { Button } from '@/components/ui';
import { Wand2, FileJson, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ComponentFormActionsProps {
  onCleanJson: () => void;
  onPreviewJson: () => void;
  hasValidJson: boolean;
}

const ComponentFormActions: React.FC<ComponentFormActionsProps> = ({ 
  onCleanJson, 
  onPreviewJson,
  hasValidJson = true
}) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={onCleanJson}
        className="gap-1"
        title="Limpa o JSON, remove propriedades desnecessárias e formata o código"
      >
        <Wand2 className="h-4 w-4" />
        Limpar e Formatar
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={onPreviewJson}
        className="gap-1"
        disabled={!hasValidJson}
        title={hasValidJson ? "Visualizar o JSON formatado" : "JSON inválido"}
      >
        {!hasValidJson ? (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        ) : (
          <FileJson className="h-4 w-4" />
        )}
        Visualizar
      </Button>
    </div>
  );
};

export default ComponentFormActions;
