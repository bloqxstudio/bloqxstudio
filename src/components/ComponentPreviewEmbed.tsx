import React, { useState, useEffect, useRef } from 'react';
import { Component } from '@/core/types';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface ComponentPreviewEmbedProps {
  component: Component;
  className?: string;
}

const ComponentPreviewEmbed: React.FC<ComponentPreviewEmbedProps> = ({
  component,
  className = ''
}) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Lazy load only when component is visible
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  // Verificar se é componente WordPress
  const isWordPressComponent = component.source === 'wordpress';
  
  // Usar o link real do WordPress se disponível, senão construir URL
  const getPreviewUrl = () => {
    if (!isWordPressComponent) return null;
    
    // Prioridade para o link real do post
    if (component.wordpress_post_url) {
      return component.wordpress_post_url;
    }
    
    // Fallback para construção manual se disponível
    if (component.source_site && component.slug) {
      let siteUrl = component.source_site;
      if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
        siteUrl = `https://${siteUrl}`;
      }
      siteUrl = siteUrl.replace(/\/$/, '');
      return `${siteUrl}/${component.slug}/`;
    }
    
    return null;
  };

  const previewUrl = getPreviewUrl();

  // Timeout para fallback em caso de carregamento lento
  useEffect(() => {
    if (isVisible && previewUrl) {
      timeoutRef.current = setTimeout(() => {
        if (loadState === 'loading') {
          setLoadState('error');
        }
      }, 6000); // Reduzido para 6 segundos
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

    // Tentar injetar CSS para forçar viewport desktop (simplified)
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          const style = iframeDoc.createElement('style');
          style.textContent = `
            body { 
              min-width: 1200px !important; 
              width: 1200px !important;
              overflow-x: hidden !important;
            }
          `;
          iframeDoc.head.appendChild(style);
        }
      }
    } catch (error) {
      // Ignorar erros de cross-origin
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
          <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Preview indisponível</div>
            <div className="text-xs text-gray-500">Use o botão "Ver Post"</div>
          </div>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-2">
            <div className="text-lg">📝</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">{component.title}</div>
            <div className="text-xs text-gray-500">
              {isWordPressComponent ? 'Post WordPress' : 'Componente Elementor'}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div 
      ref={elementRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {/* Loading state */}
      {loadState === 'loading' && isVisible && previewUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <div className="text-xs text-blue-700">Carregando...</div>
          </div>
        </div>
      )}

      {/* WordPress iframe preview - apenas se visível e com URL válida */}
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
          loading="lazy"
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
};

export default ComponentPreviewEmbed;
