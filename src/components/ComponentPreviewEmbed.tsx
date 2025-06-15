
import React, { useState, useEffect, useRef } from 'react';
import { Component } from '@/core/types';
import { Badge } from '@/components/ui/badge';
import { Globe, AlertCircle, Loader2 } from 'lucide-react';

interface ComponentPreviewEmbedProps {
  component: Component;
  className?: string;
}

const ComponentPreviewEmbed: React.FC<ComponentPreviewEmbedProps> = ({
  component,
  className = ''
}) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isVisible, setIsVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Verificar se é componente WordPress
  const isWordPressComponent = component.source === 'wordpress' && component.slug;
  const previewUrl = isWordPressComponent ? `https://superelements.io/${component.slug}/` : null;

  // Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Timeout para fallback em caso de carregamento lento
  useEffect(() => {
    if (isVisible && previewUrl) {
      timeoutRef.current = setTimeout(() => {
        if (loadState === 'loading') {
          setLoadState('error');
        }
      }, 5000); // 5 segundos timeout
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, previewUrl, loadState]);

  const handleIframeLoad = () => {
    setLoadState('loaded');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleIframeError = () => {
    setLoadState('error');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Fallback para componentes locais ou erro
  const renderFallback = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {loadState === 'error' ? (
        <>
          <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Preview indisponível</div>
            <div className="text-xs text-gray-500">Use o botão Preview para ver</div>
          </div>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-2">
            <div className="text-lg">📝</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">{component.title}</div>
            <div className="text-xs text-gray-500">Componente Elementor</div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {/* Loading state */}
      {loadState === 'loading' && isVisible && previewUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <div className="text-xs text-blue-700">Carregando preview...</div>
          </div>
        </div>
      )}

      {/* WordPress iframe preview */}
      {isVisible && previewUrl && loadState !== 'error' ? (
        <>
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0 pointer-events-none"
            style={{ 
              transform: 'scale(0.4)', 
              transformOrigin: 'top left',
              width: '250%',
              height: '250%'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`Preview: ${component.title}`}
            sandbox="allow-scripts allow-same-origin"
          />
          
          {/* Badge overlay */}
          {loadState === 'loaded' && (
            <div className="absolute top-2 right-2 z-20">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 shadow-sm">
                <Globe className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          )}
        </>
      ) : (
        renderFallback()
      )}
    </div>
  );
};

export default ComponentPreviewEmbed;
