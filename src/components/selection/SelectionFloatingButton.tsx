
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useSelectedComponents } from '@/context/SelectedComponentsContext';
import SelectedComponentsSidebar from './SelectedComponentsSidebar';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

const SelectionFloatingButton: React.FC = () => {
  const { totalSelected } = useSelectedComponents();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Get user language preference
  const language = localStorage.getItem('language') || 'en';

  if (totalSelected === 0) {
    return null;
  }

  // Handle click when user is not authenticated
  const handleButtonClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
  };

  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 shadow-lg animate-fade-in">
        {user ? (
          <SelectedComponentsSidebar 
            trigger={
              <Button 
                size="lg" 
                className="rounded-full h-14 pr-6 bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                <span className="mr-1">
                  {language === 'pt' ? 'Ver selecionados' : 'View selected'}
                </span>
                <Badge 
                  className="bg-white text-blue-700 ml-1"
                  variant="secondary"
                >
                  {totalSelected}
                </Badge>
              </Button>
            }
          />
        ) : (
          <Button 
            size="lg" 
            className="rounded-full h-14 pr-6 bg-blue-600 hover:bg-blue-700"
            onClick={handleButtonClick}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            <span className="mr-1">
              {language === 'pt' ? 'Ver selecionados' : 'View selected'}
            </span>
            <Badge 
              className="bg-white text-blue-700 ml-1"
              variant="secondary"
            >
              {totalSelected}
            </Badge>
          </Button>
        )}
      </div>
      
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getTranslation('Login Required', 'Login Necessário')}</DialogTitle>
            <DialogDescription>
              {getTranslation(
                'You need to be logged in to view and manage your selected components.',
                'Você precisa estar logado para visualizar e gerenciar seus componentes selecionados.'
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

export default SelectionFloatingButton;
