
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getStandardTransformedJson } from '@/utils/json';

interface CodeViewerProps {
  code: string;
  fileName?: string;
  title?: string;
  useStandardTransform?: boolean;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  fileName = 'elementor-component.json',
  title,
  useStandardTransform = true
}) => {
  const [copied, setCopied] = useState(false);
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleCopy = () => {
    try {
      let finalCode = code;

      // Apply standard Elementor transformation if enabled
      if (useStandardTransform && code && code.trim() !== '') {
        try {
          finalCode = getStandardTransformedJson(code);
          console.log('CodeViewer transformed JSON:', finalCode);
        } catch (transformError) {
          console.warn('CodeViewer: Standard transformation failed, using original:', transformError);
          // Continue with original code if transformation fails
        }
      }

      navigator.clipboard.writeText(finalCode);
      setCopied(true);
      
      const successMessage = useStandardTransform
        ? getTranslation(
            'Elementor standard JSON copied! Perfect to paste in Elementor.',
            'JSON Elementor padrão copiado! Perfeito para colar no Elementor.'
          )
        : getTranslation(
            'Code copied to clipboard! You can paste it in Elementor to test.',
            'Código copiado para a área de transferência! Você pode colar no Elementor para testar.'
          );
      
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
      toast.error(getTranslation('Error copying code', 'Erro ao copiar código'));
    }
  };
  
  const handleDownload = () => {
    try {
      let finalCode = code;

      // Apply standard transformation for download too
      if (useStandardTransform && code && code.trim() !== '') {
        try {
          finalCode = getStandardTransformedJson(code);
        } catch (transformError) {
          console.warn('CodeViewer download: Standard transformation failed, using original:', transformError);
        }
      }

      // Create blob and trigger download
      const blob = new Blob([finalCode], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const successMessage = useStandardTransform
        ? getTranslation(`Elementor standard ${fileName} downloaded`, `${fileName} Elementor padrão baixado com sucesso`)
        : getTranslation(`Downloaded ${fileName}`, `${fileName} baixado com sucesso`);
      
      toast.success(successMessage);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(getTranslation('Error downloading file', 'Erro ao baixar arquivo'));
    }
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
