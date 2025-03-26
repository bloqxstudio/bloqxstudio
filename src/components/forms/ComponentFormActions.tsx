
import React from 'react';
import { Button } from '@/components/ui';
import { Wand2, FileJson } from 'lucide-react';

interface ComponentFormActionsProps {
  onCleanJson: () => void;
  onPreviewJson: () => void;
}

const ComponentFormActions: React.FC<ComponentFormActionsProps> = ({ 
  onCleanJson, 
  onPreviewJson 
}) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={onCleanJson}
        className="gap-1"
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
      >
        <FileJson className="h-4 w-4" />
        Visualizar
      </Button>
    </div>
  );
};

export default ComponentFormActions;
