
import React from 'react';
import ProcessJsonButton from './ProcessJsonButton';
import JsonCopyButton from './JsonCopyButton';
import { AlertCircle, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  showElementorCopy = false
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

  const handleCopyForElementor = () => {
    const content = getJsonContent();
    
    if (!content || !isValidJson) {
      toast.warning(getTranslation(
        'Cannot copy invalid JSON', 
        'Não é possível copiar JSON inválido'
      ));
      return;
    }

    try {
      navigator.clipboard.writeText(content);
      toast.success(getTranslation(
        'Copied to clipboard! Paste directly into Elementor',
        'Copiado para área de transferência! Cole diretamente no Elementor'
      ), {
        duration: 4000,
        icon: <Copy className="h-4 w-4" />
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(getTranslation(
        'Failed to copy to clipboard',
        'Falha ao copiar para área de transferência'
      ));
    }
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

      {showElementorCopy && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyForElementor}
          disabled={!isValidJson}
          className="flex items-center gap-1 border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          <Copy size={14} />
          <span>{getTranslation('Copy for Elementor', 'Copiar para Elementor')}</span>
        </Button>
      )}

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
