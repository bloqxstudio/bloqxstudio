
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { getStandardTransformedJson } from '@/utils/json';
import { Component } from '@/core/types';

interface ComponentCardActionsProps {
  component: Component;
  onPreview: () => void;
}

const ComponentCardActions: React.FC<ComponentCardActionsProps> = ({
  component,
  onPreview,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!user) {
      toast.error('You need to be logged in to copy the code');
      return;
    }

    try {
      // Get the raw JSON from the component
      const sourceJson = component.json_code || component.code || '[]';
      
      console.log('Original JSON:', sourceJson);
      
      // Apply the EXACT same transformation as JsonTransformer for perfect Elementor compatibility
      const elementorStandardJson = getStandardTransformedJson(sourceJson);
      
      console.log('Transformed JSON:', elementorStandardJson);

      await navigator.clipboard.writeText(elementorStandardJson);
      setCopied(true);
      toast.success('JSON Elementor padrão copiado! Perfeito para colar no Elementor com estrutura completa.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error generating Elementor JSON:', error);
      
      // Fallback: try to copy original code
      try {
        await navigator.clipboard.writeText(component.json_code || component.code || '[]');
        setCopied(true);
        toast.success('Código original copiado para a área de transferência!');
        setTimeout(() => setCopied(false), 2000);
      } catch (copyError) {
        console.error('Fallback copy also failed:', copyError);
        toast.error('Erro ao copiar código');
      }
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreview}
        className="flex-1"
        title="View Component"
      >
        <Eye className="h-4 w-4 mr-1" />
        View Component
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyCode}
        disabled={copied}
        className="flex-1"
        title="Copy Elementor Standard JSON"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            Copy JSON
          </>
        )}
      </Button>
    </div>
  );
};

export default ComponentCardActions;
