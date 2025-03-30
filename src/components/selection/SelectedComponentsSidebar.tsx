
import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button, Badge } from '@/components/ui';
import { X, Move, Trash2, Download, Copy, ShoppingCart } from 'lucide-react';
import { useSelectedComponents } from '@/context/SelectedComponentsContext';
import { mergeComponentsJson } from '@/utils/json/mergeJson';
import { toast } from 'sonner';

interface SelectedComponentsSidebarProps {
  trigger?: React.ReactNode;
}

const SelectedComponentsSidebar: React.FC<SelectedComponentsSidebarProps> = ({ trigger }) => {
  const { 
    selectedComponents, 
    removeComponent, 
    clearComponents, 
    moveComponent,
    totalSelected 
  } = useSelectedComponents();
  
  const [isOpen, setIsOpen] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  
  // Get language preference - this would come from a language context in a real implementation
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleCopyToElementor = () => {
    if (selectedComponents.length === 0) {
      toast.error(getTranslation(
        'No components selected',
        'Nenhum componente selecionado'
      ));
      return;
    }
    
    const mergedJson = mergeComponentsJson(selectedComponents);
    if (!mergedJson) {
      toast.error(getTranslation(
        'Error merging component JSONs',
        'Erro ao mesclar JSONs dos componentes'
      ));
      return;
    }
    
    navigator.clipboard.writeText(mergedJson);
    toast.success(getTranslation(
      'JSONs copied to clipboard! Paste into Elementor to use.',
      'JSONs copiados para a área de transferência! Cole no Elementor para usar.'
    ));
  };

  const handleExport = () => {
    if (selectedComponents.length === 0) {
      toast.error(getTranslation(
        'No components selected for export',
        'Nenhum componente selecionado para exportar'
      ));
      return;
    }
    
    const mergedJson = mergeComponentsJson(selectedComponents);
    if (!mergedJson) {
      toast.error(getTranslation(
        'Error merging component JSONs',
        'Erro ao mesclar JSONs dos componentes'
      ));
      return;
    }

    // Create a downloadable blob
    const blob = new Blob([mergedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = url;
    link.download = getTranslation('merged-components.json', 'componentes-mesclados.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(getTranslation(
      'Merged JSON exported successfully!',
      'JSON mesclado exportado com sucesso!'
    ));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropTargetIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== targetIndex) {
      moveComponent(draggingIndex, targetIndex);
    }
    setDraggingIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDropTargetIndex(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className="relative"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            {getTranslation('Components', 'Componentes')}
            {totalSelected > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600" 
                variant="default"
              >
                {totalSelected}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>
            {getTranslation(
              `Selected Components (${totalSelected})`,
              `Componentes Selecionados (${totalSelected})`
            )}
          </SheetTitle>
          <SheetDescription>
            {getTranslation(
              'Reorder or remove selected components before exporting.',
              'Reordene ou remova componentes selecionados antes de exportar.'
            )}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col space-y-3 my-4 max-h-[70vh] overflow-y-auto pr-1">
          {selectedComponents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="mx-auto h-10 w-10 mb-2 opacity-30" />
              <p>{getTranslation(
                'No components selected',
                'Nenhum componente selecionado'
              )}</p>
              <p className="text-sm mt-2">
                {getTranslation(
                  'Select components from the gallery to add them here.',
                  'Selecione componentes na galeria para adicioná-los aqui.'
                )}
              </p>
            </div>
          ) : (
            selectedComponents.map((component, index) => (
              <div
                key={component.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center justify-between p-3 rounded-md border 
                  ${draggingIndex === index ? 'opacity-50' : ''}
                  ${dropTargetIndex === index ? 'border-primary bg-primary/5' : 'border-border'}
                  transition-colors duration-200
                `}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="cursor-move p-1 rounded hover:bg-muted"
                    title={getTranslation('Drag to reorder', 'Arrastar para reordenar')}
                  >
                    <Move size={16} />
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-sm truncate">{component.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{component.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeComponent(component.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))
          )}
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-3 mt-4 pt-4 border-t">
          {selectedComponents.length > 0 && (
            <>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={clearComponents}
                className="w-full sm:w-auto"
              >
                <Trash2 size={16} className="mr-1" />
                {getTranslation('Clear all', 'Limpar todos')}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleCopyToElementor}
                className="w-full sm:w-auto"
              >
                <Copy size={16} className="mr-1" />
                {getTranslation('Copy for Elementor', 'Copiar para Elementor')}
              </Button>
              <Button 
                onClick={handleExport}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Download size={16} className="mr-1" />
                {getTranslation('Download JSON', 'Baixar JSON')}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SelectedComponentsSidebar;
