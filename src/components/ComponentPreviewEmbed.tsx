
import React, { useState, useEffect, useRef } from 'react';
import { Component } from '@/core/types';
import { AlertCircle, Loader2 } from 'lucide-react';

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
  
  // Construir URL com parâmetros para forçar desktop
  const getDesktopPreviewUrl = () => {
    if (!isWordPressComponent) return null;
    
    const baseUrl = `https://superelements.io/${component.slug}/`;
    const url = new URL(baseUrl);
    
    // Adicionar parâmetros para forçar visualização desktop
    url.searchParams.set('desktop', '1');
    url.searchParams.set('viewport', 'desktop');
    url.searchParams.set('force_desktop', 'true');
    
    return url.toString();
  };

  const previewUrl = getDesktopPreviewUrl();

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

    // Tentar injetar CSS para forçar viewport desktop
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          // Remover meta viewport existente
          const existingViewports = iframeDoc.querySelectorAll('meta[name="viewport"]');
          existingViewports.forEach(meta => meta.remove());
          
          // Adicionar meta viewport desktop
          const meta = iframeDoc.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=1200, initial-scale=1.0, user-scalable=no';
          iframeDoc.head.appendChild(meta);
          
          // Adicionar CSS para forçar largura mínima
          const style = iframeDoc.createElement('style');
          style.textContent = `
            body { 
              min-width: 1200px !important; 
              width: 1200px !important;
              overflow-x: hidden !important;
            }
            .elementor-section-wrap { 
              min-width: 1200px !important; 
            }
          `;
          iframeDoc.head.appendChild(style);
        }
      }
    } catch (error) {
      // Ignorar erros de cross-origin, o iframe ainda funcionará
      console.log('Could not inject desktop CSS due to cross-origin restrictions');
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
            <div className="text-xs text-gray-500">Use o botão Visualizar para ver</div>
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

      {/* WordPress iframe preview - otimizado para desktop */}
      {isVisible && previewUrl && loadState !== 'error' ? (
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full border-0 pointer-events-none"
          style={{ 
            transform: 'scale(0.25)', 
            transformOrigin: 'top left',
            width: '400%',
            height: '400%'
          }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={`Preview: ${component.title}`}
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
};

export default ComponentPreviewEmbed;
