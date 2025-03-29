
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ProcessJsonButton from './ProcessJsonButton';
import JsonCopyButton from './JsonCopyButton';

interface JsonTransformerActionsProps {
  onProcessJson: () => void;
  getJsonContent: () => string;
  onCreateComponent: () => void;
  isValidJson: boolean;
  isValidating: boolean;
  isProcessing: boolean;
}

const JsonTransformerActions: React.FC<JsonTransformerActionsProps> = ({
  onProcessJson,
  getJsonContent,
  onCreateComponent,
  isValidJson,
  isValidating,
  isProcessing
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <ProcessJsonButton 
        onProcessJson={onProcessJson} 
        disabled={!isValidJson || isValidating}
        loading={isProcessing}
      />
      
      <JsonCopyButton getJsonContent={getJsonContent} />
      
      <Button 
        variant="default" 
        className="gap-1"
        onClick={onCreateComponent}
        disabled={!isValidJson}
      >
        Criar Componente
        <ArrowRight className="h-4 w-4" />
      </Button>
      
      {!isValidJson && getJsonContent() && (
        <div className="flex items-center text-destructive gap-1 text-sm ml-2">
          <span>JSON inválido</span>
        </div>
      )}
    </div>
  );
};

export default JsonTransformerActions;
