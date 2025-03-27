
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface JsonCopyButtonProps {
  getJsonContent: () => string;
}

const JsonCopyButton: React.FC<JsonCopyButtonProps> = ({ getJsonContent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    const content = getJsonContent();
    
    if (!content) {
      toast.warning('Nenhum código para copiar');
      return;
    }
    
    try {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Código copiado para área de transferência! Cole no Elementor para testar.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar para área de transferência:', error);
      toast.error('Erro ao copiar para área de transferência.');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopyToClipboard}
      className="flex items-center gap-1"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? 'Copiado!' : 'Copiar para Elementor'}</span>
    </Button>
  );
};

export default JsonCopyButton;
