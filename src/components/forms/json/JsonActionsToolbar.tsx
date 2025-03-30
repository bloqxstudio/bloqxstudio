
import React, { useState } from 'react';
import ProcessJsonButton from './ProcessJsonButton';
import JsonCopyButton from './JsonCopyButton';
import { AlertCircle, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface JsonActionsToolbarProps {
  onProcessJson: () => void;
  isValidJson: boolean;
  isValidating: boolean;
  getJsonContent: () => string;
  showElementorCopy?: boolean;
}

const JsonActionsToolbar: React.FC<JsonActionsToolbarProps> = ({
  onProcessJson,
  isValidJson,
  isValidating,
  getJsonContent,
  showElementorCopy = false
}) => {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };
  
  const handleDownload = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    const content = getJsonContent();
    
    if (!content || !isValidJson) {
      toast.warning(getTranslation(
        'Cannot download invalid JSON', 
        'Não é possível baixar JSON inválido'
      ));
      return;
    }
    
    // Create blob and download
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'elementor-component.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(getTranslation(
      'JSON downloaded successfully!',
      'JSON baixado com sucesso!'
    ));
  };

  const handleCopyForElementor = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    const content = getJsonContent();
    
    if (!content || !isValidJson) {
      toast.warning(getTranslation(
        'Cannot copy invalid JSON', 
        'Não é possível copiar JSON inválido'
      ));
      return;
    }

    try {
      navigator.clipboard.writeText(content);
      toast.success(getTranslation(
        'Copied to clipboard! Paste directly into Elementor',
        'Copiado para área de transferência! Cole diretamente no Elementor'
      ), {
        duration: 4000,
        icon: <Copy className="h-4 w-4" />
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(getTranslation(
        'Failed to copy to clipboard',
        'Falha ao copiar para área de transferência'
      ));
    }
  };

  const handleAction = (actionFn: () => void) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    actionFn();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-2">
        {user ? (
          <ProcessJsonButton 
            onProcessJson={onProcessJson} 
            disabled={!isValidJson || isValidating} 
          />
        ) : (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setShowAuthDialog(true)}
            className="flex items-center gap-1"
          >
            <AlertCircle size={14} />
            <span>{getTranslation('Process JSON', 'Processar JSON')}</span>
          </Button>
        )}
        
        {user ? (
          <JsonCopyButton getJsonContent={getJsonContent} />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAuthDialog(true)}
            className="flex items-center gap-1"
          >
            <Copy size={14} />
            <span>{getTranslation('Copy to Elementor', 'Copiar para Elementor')}</span>
          </Button>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={user ? handleDownload : () => setShowAuthDialog(true)}
          disabled={!isValidJson && user}
          className="flex items-center gap-1"
        >
          <Download size={14} />
          <span>{getTranslation('Download', 'Baixar')}</span>
        </Button>

        {showElementorCopy && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={user ? handleCopyForElementor : () => setShowAuthDialog(true)}
            disabled={!isValidJson && user}
            className="flex items-center gap-1 border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <Copy size={14} />
            <span>{getTranslation('Copy for Elementor', 'Copiar para Elementor')}</span>
          </Button>
        )}

        {!isValidJson && getJsonContent() && (
          <div className="flex items-center text-destructive gap-1 text-sm ml-2">
            <AlertCircle size={14} />
            <span>{getTranslation('Invalid JSON', 'JSON inválido')}</span>
          </div>
        )}
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getTranslation('Login Required', 'Login Necessário')}</DialogTitle>
            <DialogDescription>
              {getTranslation(
                'You need to be logged in to use this feature.',
                'Você precisa estar logado para usar este recurso.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-center text-muted-foreground">
              {getTranslation(
                'Create your free account to access all features. Our platform is currently in BETA and 100% FREE.',
                'Crie sua conta gratuita para acessar todos os recursos. Nossa plataforma está atualmente em BETA e é 100% GRATUITA.'
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
                {getTranslation('Create Free Account', 'Criar Conta Grátis')}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JsonActionsToolbar;
