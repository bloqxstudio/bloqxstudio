
import React from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Wand2, FileTerminal, Eye } from 'lucide-react';

interface ComponentFormActionsProps {
  onCleanJson: () => void;
  hasValidJson: boolean;
  removeStyles: boolean;
  onToggleRemoveStyles: () => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
}

const ComponentFormActions: React.FC<ComponentFormActionsProps> = ({
  onCleanJson,
  hasValidJson,
  removeStyles,
  onToggleRemoveStyles,
  onTogglePreview,
  showPreview = false
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

      <Toggle
        pressed={removeStyles}
        onPressedChange={onToggleRemoveStyles}
        aria-label="Aplicar Estilo Wireframe"
        className={`flex items-center gap-1 h-9 px-3 ${removeStyles ? 'bg-gray-200 border-gray-300' : ''}`}
      >
        <FileTerminal size={14} />
        <span>{removeStyles ? 'Wireframe ON' : 'Wireframe OFF'}</span>
      </Toggle>
      
      {onTogglePreview && (
        <Toggle
          pressed={showPreview}
          onPressedChange={onTogglePreview}
          aria-label="Visualizar JSON"
          className={`flex items-center gap-1 h-9 px-3 ${showPreview ? 'bg-gray-200 border-gray-300' : ''}`}
        >
          <Eye size={14} />
          <span>Visualizar</span>
        </Toggle>
      )}
    </div>
  );
};

export default ComponentFormActions;
