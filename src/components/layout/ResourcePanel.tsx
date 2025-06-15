
import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ResourcePanelProps {
  component: any;
  onClose?: () => void;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
  component,
  onClose
}) => {
  if (!component) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-muted-foreground">RESOURCE DETAILS</h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Component Image */}
        {component.image_url && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={component.image_url} 
              alt={component.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <div>
          <h2 className="font-semibold text-lg mb-1">{component.title}</h2>
          {component.description && (
            <p className="text-sm text-muted-foreground">{component.description}</p>
          )}
        </div>

        <Separator />

        {/* Tags */}
        {component.tags && component.tags.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {component.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        {component.category_name && (
          <div>
            <h4 className="font-medium text-sm mb-1">Category</h4>
            <Badge variant="outline">{component.category_name}</Badge>
          </div>
        )}

        {/* WordPress Info */}
        {component.wordpress_post_id && (
          <div>
            <h4 className="font-medium text-sm mb-2">WordPress</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Post ID: {component.wordpress_post_id}</div>
              {component.site_name && (
                <div>Site: {component.site_name}</div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Component
          </Button>
          
          {component.permalink && (
            <Button variant="outline" className="w-full" size="sm" asChild>
              <a href={component.permalink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
