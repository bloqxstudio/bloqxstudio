
import React from 'react';
import ProcessJsonButton from './ProcessJsonButton';
import JsonCopyButton from './JsonCopyButton';
import { AlertCircle } from 'lucide-react';

interface JsonActionsToolbarProps {
  onProcessJson: () => void;
  isValidJson: boolean;
  isValidating: boolean;
  getJsonContent: () => string;
}

const JsonActionsToolbar: React.FC<JsonActionsToolbarProps> = ({
  onProcessJson,
  isValidJson,
  isValidating,
  getJsonContent
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <ProcessJsonButton 
        onProcessJson={onProcessJson} 
        disabled={!isValidJson || isValidating} 
      />
      
      <JsonCopyButton getJsonContent={getJsonContent} />

      {!isValidJson && (
        <div className="flex items-center text-destructive gap-1 text-sm ml-2">
          <AlertCircle size={14} />
          <span>JSON inválido</span>
        </div>
      )}
    </div>
  );
};

export default JsonActionsToolbar;
