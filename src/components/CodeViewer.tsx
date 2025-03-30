
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download } from 'lucide-react';
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
  title?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  fileName = 'elementor-component.json',
  restricted = false,
  title
}) => {
  const [copied, setCopied] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();
  
  // Get language preference - this would come from a language context in a real implementation
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleCopy = () => {
    if (restricted && !user) {
      setShowAuthDialog(true);
      return;
    }
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(getTranslation(
      'Code copied to clipboard! You can paste it in Elementor to test.',
      'Código copiado para a área de transferência! Você pode colar no Elementor para testar.'
    ));
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    if (restricted && !user) {
      setShowAuthDialog(true);
      return;
    }
    
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
    <>
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

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getTranslation('Restricted access', 'Acesso restrito')}</DialogTitle>
            <DialogDescription>
              {getTranslation(
                'You need to be logged in to access the complete code for this component.',
                'Você precisa estar logado para acessar o código completo deste componente.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-center text-muted-foreground">
              {getTranslation(
                'Create your free account to access this and many other Elementor components.',
                'Crie sua conta gratuita para acessar este e muitos outros componentes Elementor.'
              )}
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/login" onClick={() => setShowAuthDialog(false)}>
                {getTranslation('Login', 'Entrar')}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/register" onClick={() => setShowAuthDialog(false)}>
                {getTranslation('Register', 'Registrar')}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CodeViewer;
