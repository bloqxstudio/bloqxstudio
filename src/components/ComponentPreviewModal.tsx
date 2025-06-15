
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { Component } from '@/core/types';
import { getStandardTransformedJson } from '@/utils/json';

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

  const viewportConfig = {
    desktop: { width: '1400px', height: '800px', label: 'Desktop' },
    tablet: { width: '768px', height: '600px', label: 'Tablet' },
    mobile: { width: '375px', height: '600px', label: 'Mobile' },
  };

  const currentViewport = viewportConfig[viewportSize];

  // Check if it's a WordPress component
  const isWordPressComponent = component.source === 'wordpress' && component.slug;
  
  // Build correct WordPress post URL
  const getRealPostUrl = () => {
    if (!isWordPressComponent) return null;
    
    console.log('Modal URL construction for component:', {
      wordpress_post_url: component.wordpress_post_url,
      source_site: component.source_site,
      slug: component.slug,
      component_id: component.id
    });
    
    // Priority 1: Use direct WordPress post URL if available
    if (component.wordpress_post_url) {
      let url = component.wordpress_post_url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      console.log('Modal using direct WordPress URL:', url);
      return url;
    }
    
    // Priority 2: Construct from source_site and slug
    if (component.source_site && component.slug) {
      let siteUrl = component.source_site;
      
      // Ensure the site URL has protocol and is a valid domain
      if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
        // Check if it looks like a domain name
        if (siteUrl.includes('.') && !siteUrl.includes('/')) {
          siteUrl = `https://${siteUrl}`;
        } else {
          console.warn('Modal: Invalid source_site format:', siteUrl);
          return null;
        }
      }
      
      // Remove trailing slash
      siteUrl = siteUrl.replace(/\/$/, '');
      
      // Ensure slug doesn't start with slash
      const cleanSlug = component.slug.replace(/^\//, '');
      
      const constructedUrl = `${siteUrl}/${cleanSlug}/`;
      console.log('Modal constructed WordPress URL:', constructedUrl);
      return constructedUrl;
    }
    
    console.warn('Modal: No valid URL data for WordPress component:', component.id);
    return null;
  };

  const postUrl = getRealPostUrl();

  // Log the final URL being used in modal
  useEffect(() => {
    if (isOpen) {
      if (postUrl) {
        console.log('Modal final preview URL:', postUrl);
      } else {
        console.log('Modal: No preview URL available for component:', component.id);
      }
    }
  }, [isOpen, postUrl, component.id]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setIframeKey(prev => prev + 1);
      setCopied(false);
      setZoomLevel(1);
    }
  }, [isOpen]);

  const handleCopyJson = async () => {
    try {
      // Always use the component's original JSON and apply standard transformation
      const sourceJson = component.json_code || component.code || '[]';
      console.log('Modal copying JSON from component:', sourceJson);
      
      // Apply the EXACT same transformation as other copy buttons
      const elementorStandardJson = getStandardTransformedJson(sourceJson);
      console.log('Modal transformed JSON:', elementorStandardJson);

      await navigator.clipboard.writeText(elementorStandardJson);
      setCopied(true);
      toast.success('JSON Elementor padrão copiado! Perfeito para colar no Elementor.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying JSON:', error);
      
      // Fallback: try to copy original code
      try {
        const fallbackJson = component.json_code || component.code || '[]';
        await navigator.clipboard.writeText(fallbackJson);
        setCopied(true);
        toast.success('JSON original copiado para a área de transferência!');
        setTimeout(() => setCopied(false), 2000);
      } catch (copyError) {
        console.error('Fallback copy also failed:', copyError);
        toast.error('Erro ao copiar JSON');
      }
    }
  };

  const handleDownloadJson = () => {
    try {
      // Use the same transformation logic for download
      const sourceJson = component.json_code || component.code || '[]';
      const elementorStandardJson = getStandardTransformedJson(sourceJson);
      
      const fileName = component.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      const blob = new Blob([elementorStandardJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-elementor.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('JSON Elementor padrão baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading JSON:', error);
      toast.error('Erro ao baixar arquivo');
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

  const renderPreviewContent = () => {
    if (!isWordPressComponent || !postUrl) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Component Preview Unavailable
            </h3>
            <p className="text-gray-600 max-w-sm mb-4">
              {!isWordPressComponent 
                ? "This component doesn't have a preview URL available."
                : "No valid WordPress URL found for this component."
              }
            </p>
            {component.source_site && (
              <p className="text-xs text-gray-500 break-all">
                Source: {component.source_site}
                {component.slug && ` / ${component.slug}`}
              </p>
            )}
            <p className="text-gray-600 mt-4">
              Use the "Copy JSON" button to import into Elementor.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative rounded-lg overflow-auto border-0 h-full bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50/30">
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />
        </div>
        
        <div className="relative z-10 p-8 h-full flex items-center justify-center">
          <div 
            className="relative transition-all duration-300 mx-auto rounded-lg shadow-2xl bg-white"
            style={{ 
              width: currentViewport.width,
              minWidth: viewportSize === 'desktop' ? currentViewport.width : 'auto',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center'
            }}
          >
            {/* Browser frame */}
            <div className="bg-gray-200 px-4 py-3 rounded-t-lg border-b">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 ml-4">
                  <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 max-w-md flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    {postUrl}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-b-lg">
              {isLoading && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-3 text-gray-600">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <div className="text-center">
                      <p className="font-medium">Loading component preview...</p>
                      <p className="text-sm text-gray-500">
                        {currentViewport.label} • {postUrl}
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
                      Error loading component preview
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm">
                      Unable to load the WordPress post. 
                      Please check if the URL is accessible.
                    </p>
                    <div className="space-y-2">
                      <Button onClick={handleRefresh} size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try again
                      </Button>
                      <div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(postUrl!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in new tab
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <iframe
                key={`component-preview-${iframeKey}`}
                src={postUrl!}
                className="w-full border-0 block"
                style={{ height: currentViewport.height }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={`Component Preview: ${component.title}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                {isWordPressComponent && <Globe className="h-5 w-5 text-blue-600" />}
                Component Preview: {component.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {isWordPressComponent 
                  ? `Live site: ${postUrl}`
                  : 'Elementor component visualization'
                }
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {isWordPressComponent && (
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
              )}
              
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
                    Copy JSON
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
                  Open Site
                </Button>
              )}
              
              {isWordPressComponent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {isWordPressComponent && (
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
        )}

        <div className="px-6 pb-6 flex-1 min-h-0">
          {renderPreviewContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComponentPreviewModal;
