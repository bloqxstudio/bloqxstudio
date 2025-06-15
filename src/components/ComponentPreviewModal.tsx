
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
  Copy, 
  Check, 
  Loader2,
  AlertCircle,
  RefreshCw
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
  const [copied, setCopied] = useState(false);
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

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(processedJson);
      setCopied(true);
      toast.success('JSON otimizado copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar JSON');
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

  // Criar uma visualização melhorada do JSON
  const formatJsonForDisplay = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return json;
    }
  };

  // Preview URL melhorado com formatação do JSON
  const previewUrl = `data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview - ${component.title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .preview-container {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 1000px;
          margin: 0 auto;
          min-height: calc(100vh - 40px);
        }
        .preview-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #f1f5f9;
        }
        .preview-title {
          color: #1e293b;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .preview-subtitle {
          color: #64748b;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
        }
        .json-preview {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #334155;
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 500px;
          overflow-y: auto;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .preview-note {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
          border: 2px solid #7dd3fc;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
          color: #0c4a6e;
          font-size: 14px;
          line-height: 1.5;
        }
        .preview-note strong {
          color: #0369a1;
          font-weight: 600;
        }
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin: 24px 0;
        }
        .stat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 500;
        }
        .json-preview::-webkit-scrollbar {
          width: 8px;
        }
        .json-preview::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .json-preview::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .json-preview::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="preview-header">
          <h1 class="preview-title">${component.title}</h1>
          <p class="preview-subtitle">JSON Otimizado para Elementor</p>
        </div>
        
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-number">${Math.ceil(processedJson.length / 1024)}KB</div>
            <div class="stat-label">Tamanho</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${(processedJson.match(/{"elType"/g) || []).length}</div>
            <div class="stat-label">Elementos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${(processedJson.match(/"widgetType"/g) || []).length}</div>
            <div class="stat-label">Widgets</div>
          </div>
        </div>
        
        <div class="preview-note">
          <strong>🎯 JSON Processado:</strong> Este código foi otimizado automaticamente para o Elementor. 
          Todos os elementos foram convertidos para containers quando necessário e propriedades vazias foram removidas 
          para garantir máxima compatibilidade.
        </div>
        
        <div class="json-preview">${formatJsonForDisplay(processedJson)}</div>
        
        <div class="preview-note">
          <strong>📋 Como usar:</strong> Copie este JSON usando o botão "Copiar JSON" no modal e cole no Elementor 
          através da opção "Importar Template" ou cole diretamente em uma seção/container existente. 
          O código está pronto para uso imediato.
        </div>
      </div>
    </body>
    </html>
  `)}`;

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
                Visualização do JSON otimizado para Elementor
              </p>
            </div>
            
            <div className="flex items-center gap-2">
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
                key={iframeKey}
                src={previewUrl}
                className="w-full border-0"
                style={{ height: currentViewport.height }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={`Preview: ${component.title}`}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentPreviewModal;
