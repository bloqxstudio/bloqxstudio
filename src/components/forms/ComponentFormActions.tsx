
import React from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Wand2, Paintbrush, AlertCircle } from 'lucide-react';

interface ComponentFormActionsProps {
  onProcessJson: () => void;
  hasValidJson: boolean;
  isValidating: boolean;
  removeStyles: boolean;
  onToggleRemoveStyles: () => void;
}

const ComponentFormActions: React.FC<ComponentFormActionsProps> = ({
  onProcessJson,
  hasValidJson,
  isValidating,
  removeStyles,
  onToggleRemoveStyles
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button 
        type="button" 
        variant="default" 
        size="sm"
        onClick={onProcessJson}
        disabled={!hasValidJson || isValidating}
        className="flex items-center gap-1"
      >
        <Wand2 size={14} />
        <span>Processar JSON</span>
      </Button>
      
      <Toggle
        pressed={removeStyles}
        onPressedChange={onToggleRemoveStyles}
        aria-label="Estilo Wireframe"
        className="flex items-center gap-1 h-9 px-3"
      >
        <Paintbrush size={14} />
        <span>Estilo Wireframe</span>
      </Toggle>

      {!hasValidJson && (
        <div className="flex items-center text-destructive gap-1 text-sm ml-2">
          <AlertCircle size={14} />
          <span>JSON inválido</span>
        </div>
      )}
    </div>
  );
};

export default ComponentFormActions;
