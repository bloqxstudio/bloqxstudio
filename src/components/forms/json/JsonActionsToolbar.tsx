
import React from 'react';
import ProcessJsonButton from './ProcessJsonButton';
import JsonCopyButton from './JsonCopyButton';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    
    // Create blob and download
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
    <div className="flex flex-wrap gap-2 mb-2">
      <ProcessJsonButton 
        onProcessJson={onProcessJson} 
        disabled={!isValidJson || isValidating} 
      />
      
      <JsonCopyButton getJsonContent={getJsonContent} />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={!isValidJson}
        className="flex items-center gap-1"
      >
        <Download size={14} />
        <span>{getTranslation('Download', 'Baixar')}</span>
      </Button>

      {!isValidJson && (
        <div className="flex items-center text-destructive gap-1 text-sm ml-2">
          <AlertCircle size={14} />
          <span>{getTranslation('Invalid JSON', 'JSON inválido')}</span>
        </div>
      )}
    </div>
  );
};

export default JsonActionsToolbar;
