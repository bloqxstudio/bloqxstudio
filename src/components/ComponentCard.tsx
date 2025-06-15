
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { cleanElementorJson } from '@/utils/json/cleaners';
import { Component } from '@/core/types';
import { usePreviewGenerator } from '@/hooks/usePreviewGenerator';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
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
  const [shouldLoadPreview, setShouldLoadPreview] = useState(false);
  
  const { generatePreview, getPreviewState } = usePreviewGenerator();
  const previewState = getPreviewState(component.id);

  // Intersection observer ultra-optimized for lazy loading
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.05, // Trigger earlier for better UX
    rootMargin: '100px', // Start loading 100px before
    freezeOnceVisible: true,
  });

  // Check if it's a WordPress component with valid URL
  const isWordPressComponent = component.source === 'wordpress';
  const hasRealWordPressLink = isWordPressComponent && component.wordpress_post_url;

  // Lazy load component preview very conservatively
  useEffect(() => {
    if (isVisible && !shouldLoadPreview) {
      setShouldLoadPreview(true);
      
      // Longer delay to avoid unnecessary loading during fast scroll
      const timer = setTimeout(() => {
        const shouldGeneratePreview = !isWordPressComponent &&
                                     !component.preview_image && 
                                     !previewState.previewUrl && 
                                     !previewState.isGenerating && 
                                     !previewState.error;

        if (shouldGeneratePreview) {
          generatePreview(component);
        }
      }, 300); // Increased delay to 300ms

      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldLoadPreview, component, generatePreview, previewState, isWordPressComponent]);

  const handleCopyCode = async () => {
    if (!user) {
      toast.error('You need to be logged in to copy the code');
      return;
    }

    try {
      // For WordPress posts, copy the real link
      if (hasRealWordPressLink) {
        await navigator.clipboard.writeText(component.wordpress_post_url!);
        setCopied(true);
        toast.success('Post link copied!');
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // For other components, copy the processed JSON
      const processedJson = cleanElementorJson(
        component.json_code || component.code || '[]',
        false,
        true,
        false
      );

      await navigator.clipboard.writeText(processedJson);
      setCopied(true);
      toast.success('Optimized JSON copied! Ready to paste in Elementor');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error processing and copying:', error);
      try {
        await navigator.clipboard.writeText(component.json_code || component.code || '[]');
        setCopied(true);
        toast.success('Code copied!');
        setTimeout(() => setCopied(false), 2000);
      } catch (copyError) {
        toast.error('Error copying code');
      }
    }
  };

  const handlePreview = () => {
    // For WordPress posts with real link, open in new tab
    if (hasRealWordPressLink) {
      window.open(component.wordpress_post_url, '_blank', 'noopener,noreferrer');
      return;
    }

    // For other components, open component preview modal
    setPreviewOpen(true);
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
      console.error('Error processing JSON for component preview:', error);
      return component.json_code || component.code || '[]';
    }
  };

  const getPreviewContent = () => {
    // More attractive placeholder during loading
    if (!shouldLoadPreview) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center shadow-sm">
            <div className="text-xl">⚡</div>
          </div>
        </div>
      );
    }

    // Original component preview has absolute priority
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

    // Use embedded component preview for other cases
    return <ComponentPreviewEmbed component={component} />;
  };

  const getSourceBadge = () => {
    if (component.source === 'wordpress' && component.source_site) {
      return (
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
          <Edit className="h-3 w-3 mr-1" />
          {component.source_site}
        </Badge>
      );
    }

    return null;
  };

  return (
    <>
      <Card 
        ref={elementRef}
        className="group hover:shadow-lg transition-all duration-200 border border-border/50 hover:border-border"
      >
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
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="flex-1"
              title={hasRealWordPressLink ? 'View Post' : isWordPressComponent ? 'View Site' : 'Component Preview'}
            >
              <Eye className="h-4 w-4 mr-1" />
              {hasRealWordPressLink ? 'View Post' : isWordPressComponent ? 'View Site' : 'Component Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              disabled={copied}
              className="flex-1"
              title={hasRealWordPressLink ? 'Copy Link' : 'Copy Code'}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  {hasRealWordPressLink ? 'Copy Link' : 'Copy'}
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
