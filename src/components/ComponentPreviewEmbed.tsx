
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

  // Check if it's a WordPress component
  const isWordPressComponent = component.source === 'wordpress';
  
  // Build correct WordPress URL
  const getPreviewUrl = () => {
    if (!isWordPressComponent) return null;
    
    console.log('Component data for URL construction:', {
      wordpress_post_url: component.wordpress_post_url,
      source_site: component.source_site,
      slug: component.slug,
      component_id: component.id
    });
    
    // Priority 1: Use direct WordPress post URL if available
    if (component.wordpress_post_url) {
      // Ensure the URL has protocol
      let url = component.wordpress_post_url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      console.log('Using direct WordPress URL:', url);
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
          console.warn('Invalid source_site format:', siteUrl);
          return null;
        }
      }
      
      // Remove trailing slash
      siteUrl = siteUrl.replace(/\/$/, '');
      
      // Ensure slug doesn't start with slash
      const cleanSlug = component.slug.replace(/^\//, '');
      
      const constructedUrl = `${siteUrl}/${cleanSlug}/`;
      console.log('Constructed WordPress URL:', constructedUrl);
      return constructedUrl;
    }
    
    console.warn('No valid URL data for WordPress component:', component.id);
    return null;
  };

  const previewUrl = getPreviewUrl();

  // Log the final URL being used
  useEffect(() => {
    if (previewUrl) {
      console.log('Final preview URL:', previewUrl);
    } else {
      console.log('No preview URL available for component:', component.id);
    }
  }, [previewUrl, component.id]);

  // Timeout for fallback in case of slow loading
  useEffect(() => {
    if (isVisible && previewUrl) {
      timeoutRef.current = setTimeout(() => {
        if (loadState === 'loading') {
          setLoadState('error');
        }
      }, 6000);
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

    // Try to inject CSS to force desktop viewport (simplified)
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
      // Ignore cross-origin errors
    }
  };

  const handleIframeError = () => {
    console.error('Iframe loading error for URL:', previewUrl);
    setLoadState('error');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Fallback for local components or error
  const renderFallback = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {loadState === 'error' ? (
        <>
          <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Preview unavailable</div>
            <div className="text-xs text-gray-500">
              {previewUrl ? 'Unable to load site' : 'No valid URL'}
            </div>
            {previewUrl && (
              <div className="text-xs text-gray-400 mt-1 break-all">
                {previewUrl}
              </div>
            )}
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
              {isWordPressComponent ? 'WordPress Post' : 'Elementor Component'}
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
            <div className="text-xs text-blue-700">Loading preview...</div>
          </div>
        </div>
      )}

      {/* WordPress iframe component preview - only if visible and has valid URL */}
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
          title={`Component Preview: ${component.title}`}
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
