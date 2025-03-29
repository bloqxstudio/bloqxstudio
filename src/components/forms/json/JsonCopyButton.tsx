
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

  const handleCopyToClipboard = async () => {
    const content = getJsonContent();
    
    if (!content) {
      toast.warning('Nenhum código para copiar');
      return;
    }
    
    setIsCopying(true);
    
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Código copiado para área de transferência! Cole no Elementor para testar.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar para área de transferência:', error);
      toast.error('Erro ao copiar para área de transferência. Tente copiar manualmente.');
      
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
        toast.success('Código copiado usando método alternativo!');
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Erro no método alternativo de cópia:', fallbackError);
        toast.error('Não foi possível copiar o código. Por favor selecione o texto e copie manualmente.');
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
      <span>{copied ? 'Copiado!' : isCopying ? 'Copiando...' : 'Copiar para Elementor'}</span>
    </Button>
  );
};

export default JsonCopyButton;
