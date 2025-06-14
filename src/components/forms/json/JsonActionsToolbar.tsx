import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth';
import JsonCopyButton from './JsonCopyButton';

interface JsonActionsToolbarProps {
  onProcessJson: () => void;
  isValidJson: boolean;
  isValidating: boolean;
  getJsonContent: () => string;
  showElementorCopy?: boolean;
}

const JsonActionsToolbar: React.FC<JsonActionsToolbarProps> = ({
  onProcessJson,
  isValidJson,
  isValidating,
  getJsonContent,
  showElementorCopy = true
}) => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await onProcessJson();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleProcess}
        disabled={!isValidJson || processing}
      >
        <Wand2 className="h-4 w-4 mr-2" />
        {getTranslation('Process JSON', 'Processar JSON')}
        {isValidating && (
          <Badge variant="secondary" className="ml-2">
            {getTranslation('Validating...', 'Validando...')}
          </Badge>
        )}
      </Button>
      
      {showElementorCopy && (
        <JsonCopyButton getJsonContent={getJsonContent} />
      )}
    </div>
  );
};

export default JsonActionsToolbar;
