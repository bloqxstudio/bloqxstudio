
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Eye, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { cleanElementorJson } from '@/utils/json/cleaners';
import { Component } from '@/core/types';
import { usePreviewGenerator } from '@/hooks/usePreviewGenerator';
import ComponentPreviewModal from './ComponentPreviewModal';
import PreviewFallback from './PreviewFallback';

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
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  
  const { generatePreview, getPreviewState } = usePreviewGenerator();
  const previewState = getPreviewState(component.id);

  // Gerar preview automaticamente se não houver imagem
  useEffect(() => {
    if (!component.preview_image && !previewState.previewUrl && !previewState.isGenerating && !previewState.error) {
      generatePreview(component).then(url => {
        if (url) {
          setGeneratedPreview(url);
        }
      });
    }
  }, [component, generatePreview, previewState]);

  const handleCopyCode = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para copiar o código');
      return;
    }

    try {
      const processedJson = cleanElementorJson(
        component.json_code || component.code || '[]',
        false,
        true,
        false
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

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const getProcessedJson = () => {
    try {
      return cleanElementorJson(
        component.json_code || component.code || '[]',
        false,
        true,
        false
      );
    } catch (error) {
      console.error('Erro ao processar JSON para preview:', error);
      return component.json_code || component.code || '[]';
    }
  };

  // Determinar qual preview usar
  const getPreviewContent = () => {
    if (component.preview_image) {
      return (
        <img
          src={component.preview_image}
          alt={component.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      );
    }

    if (previewState.isGenerating) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs">Gerando preview...</span>
          </div>
        </div>
      );
    }

    if (previewState.previewUrl || generatedPreview) {
      return (
        <div className="w-full h-full relative">
          <img
            src={previewState.previewUrl || generatedPreview!}
            alt={`Preview gerado: ${component.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-white/80">
              Auto
            </Badge>
          </div>
        </div>
      );
    }

    // Fallback visual inteligente
    return <PreviewFallback component={component} />;
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border border-border/50 hover:border-border">
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-50 rounded-t-lg overflow-hidden relative">
            {getPreviewContent()}
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

            {component.slug && (
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  /{component.slug}
                </Badge>
              </div>
            )}
            
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
        
        <CardFooter className="p-4 pt-0">
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
