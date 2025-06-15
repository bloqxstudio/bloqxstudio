
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import { Component } from '@/core/types';
import { usePreviewGenerator } from '@/hooks/usePreviewGenerator';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cleanElementorJson } from '@/utils/json/cleaners';
import ComponentPreviewModal from './ComponentPreviewModal';
import ComponentCardPreview from './ComponentCardPreview';
import ComponentCardContent from './ComponentCardContent';
import ComponentCardActions from './ComponentCardActions';

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
  const location = useLocation();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shouldLoadPreview, setShouldLoadPreview] = useState(false);
  
  const { generatePreview, getPreviewState } = usePreviewGenerator();
  const previewState = getPreviewState(component.id);

  // Check if we're on a component detail page
  const isComponentDetailPage = location.pathname.startsWith('/component/');

  // Intersection observer ultra-optimized for lazy loading
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.05, // Trigger earlier for better UX
    rootMargin: '100px', // Start loading 100px before
    freezeOnceVisible: true,
  });

  // Check if it's a WordPress component with valid URL
  const isWordPressComponent = component.source === 'wordpress';

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

  const handlePreview = () => {
    // Always open the preview modal
    setPreviewOpen(true);
  };

  const getProcessedJson = () => {
    try {
      const rawJson = component.json_code || component.code || '[]';
      return cleanElementorJson(rawJson, false, true, false);
    } catch (error) {
      console.error('Error processing JSON for component preview:', error);
      // Return the original JSON as fallback
      return component.json_code || component.code || '[]';
    }
  };

  return (
    <>
      <Card 
        ref={elementRef}
        className="group hover:shadow-lg transition-all duration-200 border border-border/50 hover:border-border"
      >
        <CardContent className="p-0">
          <ComponentCardPreview 
            component={component}
            shouldLoadPreview={shouldLoadPreview}
          />
          
          <ComponentCardContent component={component} />
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <ComponentCardActions 
            component={component}
            onPreview={handlePreview}
          />
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
