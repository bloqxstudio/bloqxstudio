
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Eye, ExternalLink, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
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
  
  const { generatePreview, getPreviewState, regeneratePreview } = usePreviewGenerator();
  const previewState = getPreviewState(component.id);

  // Gerar preview automaticamente se não houver imagem
  useEffect(() => {
    const shouldGeneratePreview = !component.preview_image && 
                                 !previewState.previewUrl && 
                                 !previewState.isGenerating && 
                                 !previewState.error;

    if (shouldGeneratePreview) {
      console.log(`🚀 Auto-gerando preview para: ${component.title}`);
      generatePreview(component).then(url => {
        if (url) {
          setGeneratedPreview(url);
          console.log(`✅ Preview auto-gerado para: ${component.title}`);
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

  const handleRegeneratePreview = async () => {
    console.log(`🔄 Regenerando preview manualmente para: ${component.title}`);
    toast.info('Regenerando preview...');
    
    try {
      const newPreview = await regeneratePreview(component);
      if (newPreview) {
        setGeneratedPreview(newPreview);
        toast.success('Preview regenerado com sucesso!');
      } else {
        toast.error('Não foi possível regenerar o preview');
      }
    } catch (error) {
      console.error('Erro ao regenerar preview:', error);
      toast.error('Erro ao regenerar preview');
    }
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
    // Preview original tem prioridade
    if (component.preview_image) {
      return (
        <div className="w-full h-full relative">
          <img
            src={component.preview_image}
            alt={component.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              Original
            </Badge>
          </div>
        </div>
      );
    }

    // Estado de geração
    if (previewState.isGenerating) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex flex-col items-center gap-3 text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <div className="text-center">
              <div className="text-sm font-medium">Gerando preview...</div>
              <div className="text-xs opacity-75">Renderizando componente</div>
            </div>
          </div>
        </div>
      );
    }

    // Preview gerado com sucesso
    if (previewState.previewUrl || generatedPreview) {
      const previewUrl = previewState.previewUrl || generatedPreview!;
      const method = previewState.method || 'unknown';
      
      return (
        <div className="w-full h-full relative group">
          <img
            src={previewUrl}
            alt={`Preview: ${component.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                method === 'screenshot' ? 'bg-green-100 text-green-800' : 
                method === 'svg' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'
              }`}
            >
              {method === 'screenshot' ? '📸' : method === 'svg' ? '🎨' : '🤖'}
            </Badge>
          </div>
          
          {/* Botão de regenerar no hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRegeneratePreview();
              }}
              className="bg-white/90 hover:bg-white"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Regenerar
            </Button>
          </div>
        </div>
      );
    }

    // Estado de erro
    if (previewState.error) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex flex-col items-center gap-2 text-red-600 p-4 text-center">
            <AlertCircle className="w-6 h-6" />
            <div className="text-sm font-medium">Erro no preview</div>
            <div className="text-xs opacity-75">{previewState.error}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegeneratePreview}
              className="mt-2 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Tentar novamente
            </Button>
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

            {/* Debug info (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && previewState.method && (
              <div className="text-xs text-gray-500 mb-2">
                Preview: {previewState.method} | JSON: {previewState.isValidJson !== false ? '✅' : '❌'}
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
