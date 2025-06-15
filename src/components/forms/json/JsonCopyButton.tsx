
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth';
import { getStandardTransformedJson } from '@/utils/json';

interface JsonCopyButtonProps {
  getJsonContent: () => string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showBadge?: boolean;
  useStandardTransform?: boolean;
}

const JsonCopyButton: React.FC<JsonCopyButtonProps> = ({
  getJsonContent,
  variant = 'default',
  size = 'default',
  showBadge = false,
  useStandardTransform = true,
}) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleCopyClick = () => {
    if (!user) {
      toast.error('Você precisa estar logado para copiar o código');
      return;
    }

    try {
      const rawJsonContent = getJsonContent();
      
      if (!rawJsonContent || rawJsonContent.trim() === '') {
        toast.error('Nenhum conteúdo JSON para copiar');
        return;
      }

      let finalJsonContent = rawJsonContent;

      // Apply standard BloqxKit transformation if enabled
      if (useStandardTransform) {
        try {
          finalJsonContent = getStandardTransformedJson(rawJsonContent);
        } catch (transformError) {
          console.warn('Standard transformation failed, using original:', transformError);
          // Continue with original content if transformation fails
        }
      }

      navigator.clipboard.writeText(finalJsonContent);
      setCopied(true);
      
      const successMessage = useStandardTransform 
        ? 'JSON padrão BloqxKit copiado! Pronto para o Elementor.'
        : 'Código copiado para a área de transferência!';
      
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying JSON:', error);
      toast.error('Erro ao copiar código');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopyClick}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copiado!
          {showBadge && (
            <Badge variant="secondary" className="ml-2">
              Copiado
            </Badge>
          )}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copiar JSON
          {showBadge && (
            <Badge variant="outline" className="ml-2">
              BloqxKit
            </Badge>
          )}
        </>
      )}
    </Button>
  );
};

export default JsonCopyButton;
