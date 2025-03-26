
import React from 'react';
import { Button } from '@/components/ui';
import { Wand2, FileJson, AlertTriangle, Paintbrush } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface ComponentFormActionsProps {
  onCleanJson: () => void;
  onPreviewJson: () => void;
  hasValidJson: boolean;
  removeStyles: boolean;
  onToggleRemoveStyles: () => void;
}

const ComponentFormActions: React.FC<ComponentFormActionsProps> = ({ 
  onCleanJson, 
  onPreviewJson,
  hasValidJson = true,
  removeStyles = false,
  onToggleRemoveStyles
}) => {
  return (
    <div className="space-y-3 mb-2">
      <div className="flex items-center gap-2">
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
      
      <div className="flex items-center gap-2">
        <Toggle 
          pressed={removeStyles}
          onPressedChange={onToggleRemoveStyles}
          className="gap-1 text-xs"
          title="Aplicar estilo de wireframe premium e nomenclatura Client-First"
        >
          <Paintbrush className="h-4 w-4" />
          Estilo Wireframe
        </Toggle>
        <span className="text-xs text-muted-foreground">
          {removeStyles 
            ? "Wireframe com nomenclatura Client-First" 
            : "Manter estilos originais"}
        </span>
      </div>
    </div>
  );
};

export default ComponentFormActions;
