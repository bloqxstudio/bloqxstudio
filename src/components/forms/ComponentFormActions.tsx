
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, AlertCircle } from 'lucide-react';

interface ComponentFormActionsProps {
  onProcessJson: () => void;
  hasValidJson: boolean;
  isValidating: boolean;
}

const ComponentFormActions: React.FC<ComponentFormActionsProps> = ({
  onProcessJson,
  hasValidJson,
  isValidating
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button 
        type="button" 
        variant="default" 
        size="sm"
        onClick={onProcessJson}
        disabled={!hasValidJson || isValidating}
        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
      >
        <Wand2 size={14} />
        <span>Transformar em Container</span>
      </Button>

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
