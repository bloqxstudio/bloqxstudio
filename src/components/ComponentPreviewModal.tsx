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
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Focus
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
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusMode, setFocusMode] = useState(false);

  const viewportConfig = {
    desktop: { width: '1400px', height: '800px', label: 'Desktop', mockupStyle: 'browser' },
    tablet: { width: '768px', height: '600px', label: 'Tablet', mockupStyle: 'tablet' },
    mobile: { width: '375px', height: '600px', label: 'Mobile', mockupStyle: 'phone' },
  };

  const currentViewport = viewportConfig[viewportSize];

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setIframeKey(prev => prev + 1);
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(processedJson);
      setCopied(true);
      toast.success('JSON copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar JSON:', error);
      toast.error('Erro ao copiar o JSON');
    }
  };

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

  const getMockupClasses = () => {
    const baseClasses = "relative transition-all duration-300 mx-auto";
    
    switch (currentViewport.mockupStyle) {
      case 'browser':
        return `${baseClasses} rounded-lg shadow-2xl bg-white`;
      case 'tablet':
        return `${baseClasses} rounded-2xl shadow-2xl bg-black p-4`;
      case 'phone':
        return `${baseClasses} rounded-3xl shadow-2xl bg-black p-2`;
      default:
        return baseClasses;
    }
  };

  const getMockupFrame = () => {
    switch (currentViewport.mockupStyle) {
      case 'browser':
        return (
          <div className="bg-gray-200 px-4 py-3 rounded-t-lg border-b">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 ml-4">
                <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 max-w-md">
                  {component.source === 'wordpress' && component.slug 
                    ? `https://superelements.io/${component.slug}/`
                    : 'Preview do Componente'
                  }
                </div>
              </div>
            </div>
          </div>
        );
      case 'tablet':
        return (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-400 rounded-full"></div>
        );
      case 'phone':
        return (
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const getBackgroundPattern = () => {
    return (
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>
    );
  };

  const handleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(2, zoomLevel + 0.1));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(0.5, zoomLevel - 0.1));
  };

  const getPostUrl = () => {
    if (component.source === 'wordpress' && component.slug) {
      return `https://superelements.io/${component.slug}/`;
    }
    return null;
  };

  const postUrl = getPostUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
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
                variant={focusMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
              >
                <Focus className="h-4 w-4 mr-1" />
                Foco
              </Button>
              
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs px-2 font-mono">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                  disabled={zoomLevel >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar JSON
                  </>
                )}
              </Button>
              
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

        <div className="px-6 pb-4 flex-shrink-0">
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

        <div className="px-6 pb-6 flex-1 min-h-0">
          <div 
            className={`
              relative rounded-lg overflow-auto border-0 h-full
              ${focusMode 
                ? 'bg-black/90' 
                : 'bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50/30'
              }
            `}
          >
            {getBackgroundPattern()}
            
            <div className="relative z-10 p-8 h-full flex items-center justify-center">
              <div 
                className={getMockupClasses()}
                style={{ 
                  width: currentViewport.width,
                  minWidth: viewportSize === 'desktop' ? currentViewport.width : 'auto',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center'
                }}
              >
                {getMockupFrame()}
                
                <div className="relative overflow-hidden rounded-b-lg">
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                      <div className="flex flex-col items-center gap-3 text-gray-600">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <div className="text-center">
                          <p className="font-medium">Carregando preview...</p>
                          <p className="text-sm text-gray-500">
                            Renderizando {currentViewport.label.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasError && (
                    <div className="absolute inset-0 bg-white flex items-center justify-center z-20">
                      <div className="text-center p-8">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Erro ao carregar preview
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-sm">
                          Não foi possível carregar o preview do componente. 
                          Verifique se o link está funcionando.
                        </p>
                        <Button onClick={handleRefresh} size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Tentar novamente
                        </Button>
                      </div>
                    </div>
                  )}

                  <iframe
                    key={`preview-${iframeKey}`}
                    src={postUrl || undefined}
                    className={`
                      w-full border-0 block
                      ${currentViewport.mockupStyle === 'browser' ? '' : 'rounded-lg'}
                      ${focusMode ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                    `}
                    style={{ height: currentViewport.height }}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title={`Preview: ${component.title}`}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                </div>
                
                {focusMode && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-lg -z-10 blur-xl opacity-75"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentPreviewModal;
