
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Eye, ExternalLink, Loader2, RefreshCw, AlertCircle, Edit, Sync } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { cleanElementorJson } from '@/utils/json/cleaners';
import { Component } from '@/core/types';
import { usePreviewGenerator } from '@/hooks/usePreviewGenerator';
import ComponentPreviewModal from './ComponentPreviewModal';
import ComponentPreviewEmbed from './ComponentPreviewEmbed';

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
  
  const { generatePreview, getPreviewState, regeneratePreview } = usePreviewGenerator();
  const previewState = getPreviewState(component.id);

  // Verificar se é um componente do WordPress com URL válida
  const isWordPressComponent = component.source === 'wordpress' && component.slug;
  const isSuperelementsComponent = component.source === 'superelements';
  const isOwnSite = component.source === 'wordpress' && component.wordpress_site_id;

  // Gerar preview automaticamente apenas se não for WordPress e não houver imagem
  useEffect(() => {
    const shouldGeneratePreview = !isWordPressComponent &&
                                 !component.preview_image && 
                                 !previewState.previewUrl && 
                                 !previewState.isGenerating && 
                                 !previewState.error;

    if (shouldGeneratePreview) {
      generatePreview(component);
    }
  }, [component, generatePreview, previewState, isWordPressComponent]);

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
      // Se falhar na limpeza, tentar copiar o código original
      try {
        await navigator.clipboard.writeText(component.json_code || component.code || '[]');
        setCopied(true);
        toast.success('Código copiado!');
        setTimeout(() => setCopied(false), 2000);
      } catch (copyError) {
        toast.error('Erro ao copiar o código');
      }
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleEdit = () => {
    // Implementar navegação para edição do componente próprio
    console.log('Editar componente:', component.id);
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleSync = async () => {
    // Implementar sincronização do componente
    console.log('Sincronizar componente:', component.id);
    toast.info('Sincronizando componente...');
  };

  const handleRegeneratePreview = async () => {
    // Não regenerar para componentes WordPress
    if (isWordPressComponent) {
      toast.info('Componentes do WordPress são exibidos diretamente do site');
      return;
    }

    toast.info('Regenerando preview...');
    
    try {
      const newPreview = await regeneratePreview(component);
      if (newPreview) {
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

  // Usar preview original se disponível, senão usar preview embutido
  const getPreviewContent = () => {
    // Preview original tem prioridade absoluta
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

    // Usar preview embutido (real) para todos os outros casos
    return <ComponentPreviewEmbed component={component} />;
  };

  const getSourceBadge = () => {
    if (isSuperelementsComponent) {
      return (
        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
          <ExternalLink className="h-3 w-3 mr-1" />
          Superelements
        </Badge>
      );
    }

    if (isOwnSite) {
      return (
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
          <Edit className="h-3 w-3 mr-1" />
          {component.source_site}
        </Badge>
      );
    }

    return null;
  };

  const getActionButtons = () => {
    if (isOwnSite) {
      // Botões para sites próprios
      return (
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            className="flex-1"
          >
            <Sync className="h-4 w-4 mr-1" />
            Sync
          </Button>
        </div>
      );
    }

    // Botões padrão para Superelements e outros
    return (
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          {isWordPressComponent ? 'Ver Site' : 'Visualizar'}
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
    );
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border border-border/50 hover:border-border">
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-50 rounded-t-lg overflow-hidden relative">
            {getPreviewContent()}
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {component.title}
              </h3>
              {getSourceBadge()}
            </div>

            {component.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {component.description}
              </p>
            )}

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
          {getActionButtons()}
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
