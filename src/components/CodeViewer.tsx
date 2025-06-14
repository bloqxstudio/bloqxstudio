
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CodeViewerProps {
  code: string;
  fileName?: string;
  title?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  fileName = 'elementor-component.json',
  title
}) => {
  const [copied, setCopied] = useState(false);
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(getTranslation(
      'Code copied to clipboard! You can paste it in Elementor to test.',
      'Código copiado para a área de transferência! Você pode colar no Elementor para testar.'
    ));
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    // Create blob and trigger download
    const blob = new Blob([code], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(getTranslation(
      `Downloaded ${fileName}`,
      `${fileName} baixado com sucesso`
    ));
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleCopy}
        size="sm"
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            {getTranslation('Copied!', 'Copiado!')}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            {title ? title : getTranslation("Copy to Elementor", "Copiar para Elementor")}
          </>
        )}
      </Button>
      
      <Button
        onClick={handleDownload}
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {getTranslation('Download', 'Baixar')}
      </Button>
    </div>
  );
};

export default CodeViewer;
