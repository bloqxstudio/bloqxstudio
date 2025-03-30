
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download } from 'lucide-react';
import ProcessJsonButton from './ProcessJsonButton';
import JsonCopyButton from './JsonCopyButton';
import { toast } from 'sonner';

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
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };
  
  const handleDownload = () => {
    const content = getJsonContent();
    
    if (!content || !isValidJson) {
      toast.warning(getTranslation(
        'Cannot download invalid JSON',
        'Não é possível baixar JSON inválido'
      ));
      return;
    }
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'elementor-component.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(getTranslation(
      'JSON downloaded successfully!',
      'JSON baixado com sucesso!'
    ));
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <ProcessJsonButton 
        onProcessJson={onProcessJson} 
        disabled={!isValidJson || isValidating}
        loading={isProcessing}
      />
      
      <JsonCopyButton getJsonContent={getJsonContent} />
      
      <Button 
        variant="outline" 
        className="gap-1"
        onClick={handleDownload}
        disabled={!isValidJson}
      >
        <Download className="h-4 w-4" />
        {getTranslation('Download', 'Baixar')}
      </Button>
      
      <Button 
        variant="default" 
        className="gap-1"
        onClick={onCreateComponent}
        disabled={!isValidJson}
      >
        {getTranslation('Create Component', 'Criar Componente')}
        <ArrowRight className="h-4 w-4" />
      </Button>
      
      {!isValidJson && getJsonContent() && (
        <div className="flex items-center text-destructive gap-1 text-sm ml-2">
          <span>{getTranslation('Invalid JSON', 'JSON inválido')}</span>
        </div>
      )}
    </div>
  );
};

export default JsonTransformerActions;
