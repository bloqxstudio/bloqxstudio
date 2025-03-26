
import React from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Wand2, Eye, ArrowUpToDot, ChevronsUpDown } from 'lucide-react';

interface ComponentFormActionsProps {
  onCleanJson: () => void;
  onPreviewJson: () => void;
  hasValidJson: boolean;
  removeStyles: boolean;
  onToggleRemoveStyles: () => void;
  wireframeMode: boolean;
  onToggleWireframeMode: () => void;
}

const ComponentFormActions: React.FC<ComponentFormActionsProps> = ({
  onCleanJson,
  onPreviewJson,
  hasValidJson,
  removeStyles,
  onToggleRemoveStyles,
  wireframeMode,
  onToggleWireframeMode
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={onCleanJson}
        disabled={!hasValidJson}
        className="flex items-center gap-1"
      >
        <Wand2 size={14} />
        <span>Limpar JSON</span>
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={onPreviewJson}
        disabled={!hasValidJson}
        className="flex items-center gap-1"
      >
        <Eye size={14} />
        <span>Pré-visualizar</span>
      </Button>

      <Toggle
        pressed={removeStyles}
        onPressedChange={onToggleRemoveStyles}
        aria-label="Remover estilos"
        className="flex items-center gap-1 h-9 px-3"
      >
        <ArrowUpToDot size={14} />
        <span>Estilo Wireframe</span>
      </Toggle>

      <Toggle
        pressed={wireframeMode}
        onPressedChange={onToggleWireframeMode}
        aria-label="Modo Wireframe"
        className="flex items-center gap-1 h-9 px-3"
      >
        <ChevronsUpDown size={14} />
        <span>Wireframe Completo</span>
      </Toggle>
    </div>
  );
};

export default ComponentFormActions;
