
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface CodeViewerProps {
  code: string;
  fileName?: string;
  restricted?: boolean;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  fileName = 'elementor-component.json',
  restricted = false
}) => {
  const [copied, setCopied] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();

  const handleCopy = () => {
    if (restricted && !user) {
      setShowAuthDialog(true);
      return;
    }
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button 
        onClick={handleCopy}
        size="sm"
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copiar
          </>
        )}
      </Button>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso restrito</DialogTitle>
            <DialogDescription>
              Você precisa estar logado para acessar o código completo deste componente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-center text-muted-foreground">
              Crie sua conta gratuita para acessar este e muitos outros componentes Elementor.
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/login" onClick={() => setShowAuthDialog(false)}>
                Entrar
              </Link>
            </Button>
            <Button asChild>
              <Link to="/register" onClick={() => setShowAuthDialog(false)}>
                Registrar
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CodeViewer;
