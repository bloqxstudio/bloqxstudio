
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download } from 'lucide-react';
import ProcessJsonButton from './ProcessJsonButton';
import JsonCopyButton from './JsonCopyButton';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface JsonTransformerActionsProps {
  onProcessJson: () => void;
  getJsonContent: () => string;
  onCreateComponent: () => void;
  isValidJson: boolean;
  isValidating: boolean;
  isProcessing: boolean;
}

const JsonTransformerActions: React.FC<JsonTransformerActionsProps> = ({
  onProcessJson,
  getJsonContent,
  onCreateComponent,
  isValidJson,
  isValidating,
  isProcessing
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
    
    // Create blob and trigger download
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

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {user ? (
          <ProcessJsonButton 
            onProcessJson={onProcessJson} 
            disabled={!isValidJson || isValidating}
            loading={isProcessing}
          />
        ) : (
          <Button 
            variant="default" 
            className="gap-1"
            onClick={() => setShowAuthDialog(true)}
          >
            {getTranslation('Process JSON', 'Processar JSON')}
          </Button>
        )}
        
        {user ? (
          <JsonCopyButton getJsonContent={getJsonContent} />
        ) : (
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={() => setShowAuthDialog(true)}
          >
            {getTranslation('Copy to Elementor', 'Copiar para Elementor')}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="gap-1"
          onClick={() => user ? handleDownload() : setShowAuthDialog(true)}
          disabled={!isValidJson && !!user}
        >
          <Download className="h-4 w-4" />
          {getTranslation('Download', 'Baixar')}
        </Button>
        
        <Button 
          variant="default" 
          className="gap-1"
          onClick={() => user ? onCreateComponent() : setShowAuthDialog(true)}
          disabled={!isValidJson && !!user}
        >
          {getTranslation('Create Component', 'Criar Componente')}
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        {!isValidJson && getJsonContent() && (
          <div className="flex items-center text-destructive gap-1 text-sm ml-2">
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

export default JsonTransformerActions;
