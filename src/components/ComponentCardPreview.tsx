
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { Component } from '@/core/types';
import ComponentPreviewEmbed from './ComponentPreviewEmbed';

interface ComponentCardPreviewProps {
  component: Component;
  shouldLoadPreview: boolean;
}

const ComponentCardPreview: React.FC<ComponentCardPreviewProps> = ({
  component,
  shouldLoadPreview,
}) => {
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

  return (
    <div className="aspect-video bg-gray-50 rounded-t-lg overflow-hidden relative">
      {getPreviewContent()}
    </div>
  );
};

export default ComponentCardPreview;
