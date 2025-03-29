
import React from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface JsonValidityIndicatorProps {
  isValidJson: boolean;
  isElementorJson: boolean;
  hasContent: boolean;
  isValidating?: boolean;
}

const JsonValidityIndicator: React.FC<JsonValidityIndicatorProps> = ({
  isValidJson,
  isElementorJson,
  hasContent,
  isValidating = false
}) => {
  if (isValidating) {
    return (
      <div className="mt-2 flex items-center text-muted-foreground gap-1 text-sm">
        <Loader2 size={16} className="animate-spin" />
        <span>Validando JSON...</span>
      </div>
    );
  }
  
  if (!hasContent) return null;
  
  if (!isValidJson) {
    return (
      <div className="mt-2 flex items-center text-destructive gap-1 text-sm">
        <AlertCircle size={16} />
        <span>JSON inválido</span>
      </div>
    );
  }
  
  if (isValidJson) {
    return (
      <div className="mt-2 flex items-center text-green-600 gap-1 text-sm">
        <Check size={16} />
        <span>JSON válido</span>
        
        {!isElementorJson && (
          <div className="ml-2 text-amber-600">
            (Não parece ser um componente Elementor)
          </div>
        )}
      </div>
    );
  }
  
  return null;
};

export default JsonValidityIndicator;
