import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Download, Copy, Check, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';

interface JsonTransformerActionsProps {
  onProcessJson: () => void;
  getJsonContent: () => string;
  isValidJson: boolean;
  isValidating?: boolean;
  onGenerateTemplate?: (type: 'hero' | 'features' | 'form') => void;
}

const JsonTransformerActions: React.FC<JsonTransformerActionsProps> = ({
  onProcessJson,
  getJsonContent,
  isValidJson,
  isValidating,
  onGenerateTemplate
}) => {
  const [isSimplified, setIsSimplified] = useState(false);
  const { user } = useAuth();
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleTemplateGeneration = (type: 'hero' | 'features' | 'form') => {
    if (onGenerateTemplate) {
      onGenerateTemplate(type);
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onProcessJson}
        disabled={!isValidJson || !!isValidating}
      >
        <Wand2 className="h-4 w-4 mr-2" />
        {getTranslation('Process JSON', 'Processar JSON')}
      </Button>
      
      {onGenerateTemplate && (
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleTemplateGeneration('hero')}
          >
            <FileText className="h-4 w-4 mr-2" />
            {getTranslation('Hero', 'Hero')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleTemplateGeneration('features')}
          >
            <Image className="h-4 w-4 mr-2" />
            {getTranslation('Features', 'Recursos')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleTemplateGeneration('form')}
          >
            <FileText className="h-4 w-4 mr-2" />
            {getTranslation('Form', 'Formulário')}
          </Button>
        </>
      )}
    </div>
  );
};

export default JsonTransformerActions;
