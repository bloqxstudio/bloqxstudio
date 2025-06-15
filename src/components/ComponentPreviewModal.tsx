
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Download,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Component } from '@/core/types';

interface ComponentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: Component;
  processedJson: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const ComponentPreviewModal: React.FC<ComponentPreviewModalProps> = ({
  isOpen,
  onClose,
  component,
  processedJson,
}) => {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const viewportConfig = {
    desktop: { width: '100%', height: '600px', label: 'Desktop' },
    tablet: { width: '768px', height: '600px', label: 'Tablet' },
    mobile: { width: '375px', height: '600px', label: 'Mobile' },
  };

  const currentViewport = viewportConfig[viewportSize];

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setIframeKey(prev => prev + 1);
    }
  }, [isOpen]);

  const handleDownloadJson = () => {
    try {
      // Criar um nome de arquivo limpo baseado no título
      const fileName = component.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      // Criar blob com o JSON processado
      const blob = new Blob([processedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-elementor.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL
      URL.revokeObjectURL(url);
      
      toast.success('JSON baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer download do JSON:', error);
      toast.error('Erro ao fazer download do arquivo');
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey(prev => prev + 1);
  };

  // Construir URL do post usando o slug real
  const getPostUrl = () => {
    if (component.source === 'wordpress' && component.slug) {
      return `https://superelements.io/${component.slug}/`;
    }
    return null;
  };

  const postUrl = getPostUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Preview: {component.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {component.slug ? `/${component.slug}` : 'Visualização do componente renderizado'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJson}
              >
                <Download className="h-4 w-4 mr-1" />
                Download JSON
              </Button>
              
              {postUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(postUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Abrir Post
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Viewport:</span>
            <div className="flex gap-1">
              <Button
                variant={viewportSize === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewportSize('desktop')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Desktop
              </Button>
              <Button
                variant={viewportSize === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewportSize('tablet')}
              >
                <Tablet className="h-4 w-4 mr-1" />
                Tablet
              </Button>
              <Button
                variant={viewportSize === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewportSize('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </Button>
            </div>
            
            <Badge variant="outline" className="ml-auto">
              {currentViewport.width} × {currentViewport.height}
            </Badge>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden border">
            <div 
              className="mx-auto transition-all duration-300"
              style={{ 
                width: currentViewport.width,
                maxWidth: '100%'
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando preview...</span>
                  </div>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-600 mb-4">Erro ao carregar preview</p>
                    <Button onClick={handleRefresh} size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Tentar novamente
                    </Button>
                  </div>
                </div>
              )}

              <iframe
                key={`preview-${iframeKey}`}
                src={postUrl || undefined}
                className="w-full border-0"
                style={{ height: currentViewport.height }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={`Preview: ${component.title}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentPreviewModal;
