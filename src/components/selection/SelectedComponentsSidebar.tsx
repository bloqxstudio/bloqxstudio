
import React, { useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight, Trash2, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import { Link } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import type { Component } from '@/core/types';
import { getStandardTransformedJson } from '@/utils/json';

interface SelectedComponentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SelectedComponentsSidebar: React.FC<SelectedComponentsSidebarProps> = ({ isOpen, onClose }) => {
  const { selectedComponents, removeComponent, clearSelectedComponents } = useSelectedComponents();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Get language preference - this would come from a language context in a real implementation
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleCopyCode = (e: React.MouseEvent, component: Component) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      // Use json_code if available, otherwise fall back to code
      const sourceJson = component.json_code || component.code || '[]';
      console.log('Sidebar copying from component:', sourceJson);
      
      // Apply the EXACT same transformation as other copy buttons
      const elementorStandardJson = getStandardTransformedJson(sourceJson);
      console.log('Sidebar transformed JSON:', elementorStandardJson);

      navigator.clipboard.writeText(elementorStandardJson);
      toast.success(getTranslation(
        'Elementor standard JSON copied! Perfect for pasting in Elementor.', 
        'JSON Elementor padrão copiado! Perfeito para colar no Elementor.'
      ));
    } catch (error) {
      console.error('Error copying and transforming JSON:', error);
      
      // Fallback: copy original code
      try {
        const fallbackCode = component.json_code || component.code;
        navigator.clipboard.writeText(fallbackCode);
        toast.success(getTranslation(
          'Original code copied to clipboard!', 
          'Código original copiado para a área de transferência!'
        ));
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        toast.error(getTranslation('Error copying code', 'Erro ao copiar código'));
      }
    }
  };
  
  const handleDownload = (e: React.MouseEvent, component: Component) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      // Use the same transformation logic for download
      const sourceJson = component.json_code || component.code || '[]';
      const elementorStandardJson = getStandardTransformedJson(sourceJson);
      
      const filename = `${component.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      
      // Create blob and download it
      const blob = new Blob([elementorStandardJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(getTranslation(
        `Elementor standard ${filename} downloaded successfully`, 
        `${filename} Elementor padrão baixado com sucesso`
      ));
    } catch (error) {
      console.error('Error downloading JSON:', error);
      
      // Fallback: download original code
      try {
        const fallbackCode = component.json_code || component.code;
        const filename = `${component.title.toLowerCase().replace(/\s+/g, '-')}.json`;
        const blob = new Blob([fallbackCode], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(getTranslation(
          `Downloaded ${filename}`, 
          `${filename} baixado com sucesso`
        ));
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        toast.error(getTranslation('Error downloading file', 'Erro ao baixar arquivo'));
      }
    }
  };

  const handleRemoveComponent = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeComponent(componentId);
    toast.info(getTranslation(
      'Component removed from selection',
      'Componente removido da seleção'
    ));
  };

  const handleClearSelection = () => {
    clearSelectedComponents();
    toast.error(getTranslation(
      'Selection cleared',
      'Seleção limpa'
    ));
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-secondary border-l border-muted shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <Card className="h-full rounded-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 pl-4 pr-4">
          <CardTitle className="text-lg font-medium">{getTranslation('Selected Components', 'Componentes Selecionados')}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">{getTranslation('Close', 'Fechar')}</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {selectedComponents.length === 0 ? (
            <div className="text-center text-muted-foreground">
              {getTranslation('No components selected yet.', 'Nenhum componente selecionado ainda.')}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-150px)] pr-2">
              {selectedComponents.map((component) => (
                <div key={component.id} className="mb-4">
                  <Card className="bg-secondary-foreground/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium truncate">{component.title}</CardTitle>
                      <Badge variant="secondary">{component.visibility}</Badge>
                    </CardHeader>
                    <CardContent className="grid gap-3 p-2">
                      <div className="text-sm text-muted-foreground line-clamp-2 h-10">
                        {component.description || 'No description available'}
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-7 w-7 p-1 hover-lift"
                          onClick={(e) => handleCopyCode(e, component)}
                          title={getTranslation('Copy Elementor JSON', 'Copiar JSON Elementor')}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-7 w-7 p-1 hover-lift"
                          onClick={(e) => handleDownload(e, component)}
                          title={getTranslation('Download Elementor JSON', 'Baixar JSON Elementor')}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-7 w-7 p-1 hover-lift"
                          onClick={(e) => handleRemoveComponent(e, component.id)}
                          title={getTranslation('Remove from selection', 'Remover da seleção')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
        {selectedComponents.length > 0 && (
          <div className="p-4">
            <Separator />
            <Button variant="destructive" className="w-full mt-4" onClick={handleClearSelection}>
              {getTranslation('Clear Selection', 'Limpar Seleção')}
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getTranslation('Create a Free Account', 'Crie uma Conta Grátis')}</DialogTitle>
            <DialogDescription>
              {getTranslation(
                'You need to be logged in to use this component.',
                'Você precisa estar logado para utilizar este componente.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-center text-muted-foreground">
              {getTranslation(
                'Our platform is currently in BETA and 100% FREE. Create your account to access all Elementor components.',
                'Nossa plataforma está atualmente em BETA e é 100% GRATUITA. Crie sua conta para acessar todos os componentes Elementor.'
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
                {getTranslation('Register Now', 'Registrar Agora')}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectedComponentsSidebar;
