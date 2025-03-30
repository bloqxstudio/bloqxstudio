
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface JsonCopyButtonProps {
  getJsonContent: () => string;
}

const JsonCopyButton: React.FC<JsonCopyButtonProps> = ({ getJsonContent }) => {
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  // Get language preference - this would come from a language context in a real implementation
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleCopyToClipboard = async () => {
    const content = getJsonContent();
    
    if (!content) {
      toast.warning(getTranslation('No code to copy', 'Nenhum código para copiar'));
      return;
    }
    
    setIsCopying(true);
    
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(getTranslation(
        'Code copied to clipboard! Paste in Elementor to test.',
        'Código copiado para área de transferência! Cole no Elementor para testar.'
      ));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error(getTranslation(
        'Error copying to clipboard. Try copying manually.',
        'Erro ao copiar para área de transferência. Tente copiar manualmente.'
      ));
      
      // Fallback method for clipboard copy
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        toast.success(getTranslation(
          'Code copied using alternative method!',
          'Código copiado usando método alternativo!'
        ));
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Error in fallback copy method:', fallbackError);
        toast.error(getTranslation(
          'Could not copy the code. Please select the text and copy manually.',
          'Não foi possível copiar o código. Por favor selecione o texto e copie manualmente.'
        ));
      }
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopyToClipboard}
      disabled={isCopying}
      className="flex items-center gap-1"
    >
      {copied ? <Check size={14} /> : isCopying ? <AlertCircle size={14} /> : <Copy size={14} />}
      <span>
        {copied 
          ? getTranslation('Copied!', 'Copiado!') 
          : isCopying 
            ? getTranslation('Copying...', 'Copiando...') 
            : getTranslation('Copy to Elementor', 'Copiar para Elementor')}
      </span>
    </Button>
  );
};

export default JsonCopyButton;
