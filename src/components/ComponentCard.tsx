
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import { cleanElementorJson } from '@/utils/json/cleaners';
import { Component } from '@/core/types';
import ComponentPreviewModal from './ComponentPreviewModal';

interface ComponentCardProps {
  component: Component;
  onSelect?: (component: Component) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onSelect,
  isSelected = false,
  showSelectButton = false,
}) => {
  const { user } = useAuth();
  const { toggleComponent, selectedComponents } = useSelectedComponents();
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isComponentSelected = selectedComponents.some(c => c.id === component.id);

  const handleCopyCode = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para copiar o código');
      return;
    }

    try {
      // Processar JSON com cleanElementorJson antes de copiar
      const processedJson = cleanElementorJson(
        component.json_code || component.code || '[]',
        false, // não remover estilos
        true,  // wrap em container
        false  // não aplicar estrutura padrão
      );

      await navigator.clipboard.writeText(processedJson);
      setCopied(true);
      toast.success('JSON otimizado copiado! Pronto para colar no Elementor');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao processar e copiar JSON:', error);
      toast.error('Erro ao processar o código');
    }
  };

  const handleToggleSelect = () => {
    toggleComponent(component);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const getProcessedJson = () => {
    try {
      return cleanElementorJson(
        component.json_code || component.code || '[]',
        false, // não remover estilos
        true,  // wrap em container
        false  // não aplicar estrutura padrão
      );
    } catch (error) {
      console.error('Erro ao processar JSON para preview:', error);
      return component.json_code || component.code || '[]';
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border border-border/50 hover:border-border">
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-50 rounded-t-lg overflow-hidden relative">
            {component.preview_image ? (
              <img
                src={component.preview_image}
                alt={component.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <span className="text-gray-400 text-sm">Sem preview</span>
              </div>
            )}
            
            {component.source === 'wordpress' && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-700 border-blue-200"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                WordPress
              </Badge>
            )}
          </div>
          
          <div className="p-4">
            <div className="mb-2">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                {component.title}
              </h3>
              {component.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {component.description}
                </p>
              )}
            </div>
            
            {component.tags && component.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {component.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {component.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{component.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 space-y-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              disabled={copied}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
          
          <div className="flex gap-2 w-full">
            <Button asChild variant="default" size="sm" className="flex-1">
              <Link to={`/component/${component.id}`}>
                Ver detalhes
              </Link>
            </Button>
            
            {showSelectButton && (
              <Button
                variant={isComponentSelected ? "default" : "outline"}
                size="sm"
                onClick={handleToggleSelect}
                className="flex-1"
              >
                {isComponentSelected ? 'Selecionado' : 'Selecionar'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <ComponentPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        component={component}
        processedJson={getProcessedJson()}
      />
    </>
  );
};

export default ComponentCard;
