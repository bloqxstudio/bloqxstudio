import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Package, 
  FileJson,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import { Component } from '@/lib/database.types';

interface SelectedComponentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SelectedComponentsSidebar: React.FC<SelectedComponentsSidebarProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    selectedComponents, 
    removeComponent, 
    clearAllComponents,
    isComponentVisible,
    setComponentVisibility
  } = useSelectedComponents();
  const [isClearing, setIsClearing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  useEffect(() => {
    // Prevent scrolling when the sidebar is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup when the component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleRemoveComponent = (e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    e.preventDefault();
    removeComponent(componentId);
    toast.info(getTranslation(
      'Component removed from selection',
      'Componente removido da seleção'
    ));
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    // Simulate a delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    clearAllComponents();
    setIsClearing(false);
    toast.success(getTranslation(
      'All components removed from selection',
      'Todos os componentes removidos da seleção'
    ));
    onClose();
  };
  
  const handleDownloadAll = async () => {
    setIsDownloading(true);
    
    // Simulate a delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a zip file with all components
    if (selectedComponents.length === 0) {
      toast.error(getTranslation(
        'No components selected',
        'Nenhum componente selecionado'
      ));
      setIsDownloading(false);
      return;
    }
    
    // Convert selectedComponents to JSON
    const componentsJson = JSON.stringify(selectedComponents, null, 2);

    // Create a blob from the JSON
    const blob = new Blob([componentsJson], { type: 'application/json' });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elementor-components.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke the URL
    URL.revokeObjectURL(url);
    
    setIsDownloading(false);
    toast.success(getTranslation(
      'Components downloaded successfully',
      'Componentes baixados com sucesso'
    ));
  };
  
  const handleCopyAll = async () => {
    setIsCopying(true);
    
    // Simulate a delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (selectedComponents.length === 0) {
      toast.error(getTranslation(
        'No components selected',
        'Nenhum componente selecionado'
      ));
      setIsCopying(false);
      return;
    }

    // Convert selectedComponents to JSON
    const componentsJson = JSON.stringify(selectedComponents, null, 2);

    // Copy the JSON to the clipboard
    navigator.clipboard.writeText(componentsJson);
    
    setIsCopying(false);
    toast.success(getTranslation(
      'Components copied to clipboard',
      'Componentes copiados para a área de transferência'
    ));
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full bg-black/20 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <Card className="absolute top-0 right-0 h-full w-96 shadow-xl flex flex-col bg-background border-l border-border/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-6 pr-4">
          <CardTitle className="text-lg font-medium">
            <Package className="h-4 w-4 mr-2 inline-block align-middle" />
            {getTranslation('Selected Components', 'Componentes Selecionados')}
            <Badge variant="secondary" className="ml-2">{selectedComponents.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" className="hover:bg-secondary/50" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 flex-grow overflow-y-auto">
          {selectedComponents.length === 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              {getTranslation('No components selected yet.', 'Nenhum componente selecionado ainda.')}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedComponents.map((component) => (
                <div key={component.id} className="border rounded-md p-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="mr-2 hover:bg-secondary/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setComponentVisibility(component.id, !isComponentVisible(component.id));
                        }}
                        title={isComponentVisible(component.id) ? 
                          getTranslation('Hide component', 'Ocultar componente') : 
                          getTranslation('Show component', 'Exibir componente')}
                      >
                        {isComponentVisible(component.id) ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <h4 className="font-medium text-sm">{component.title}</h4>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-500/20"
                      onClick={(e) => handleRemoveComponent(e, component.id)}
                      title={getTranslation('Remove component', 'Remover componente')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <Separator />

        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="justify-center hover-lift"
              onClick={handleCopyAll}
              disabled={isCopying}
            >
              {isCopying ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {getTranslation('Copied!', 'Copiado!')}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  {getTranslation('Copy All', 'Copiar Tudo')}
                </>
              )}
            </Button>
            <Button 
              className="justify-center hover-lift"
              onClick={handleDownloadAll}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {getTranslation('Downloaded!', 'Baixado!')}
                </>
              ) : (
                <>
                  <FileJson className="h-4 w-4 mr-2" />
                  {getTranslation('Download All', 'Baixar Tudo')}
                </>
              )}
            </Button>
          </div>
          <Button 
            variant="destructive" 
            className="w-full mt-2 justify-center hover-lift"
            onClick={handleClearAll}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {getTranslation('Cleared!', 'Limpo!')}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {getTranslation('Clear All', 'Limpar Tudo')}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SelectedComponentsSidebar;
