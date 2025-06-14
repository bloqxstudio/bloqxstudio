import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth';

interface JsonCopyButtonProps {
  getJsonContent: () => string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showBadge?: boolean;
}

const JsonCopyButton: React.FC<JsonCopyButtonProps> = ({
  getJsonContent,
  variant = 'default',
  size = 'default',
  showBadge = false,
}) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleCopyClick = () => {
    if (!user) {
      toast.error('Você precisa estar logado para copiar o código');
      return;
    }

    const jsonContent = getJsonContent();
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    toast.success('Código copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
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
              Copiar
            </Badge>
          )}
        </>
      )}
    </Button>
  );
};

export default JsonCopyButton;
