
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { cleanElementorJson } from '@/utils/json/cleaners';
import { Component } from '@/core/types';

interface ComponentCardActionsProps {
  component: Component;
  onPreview: () => void;
}

const ComponentCardActions: React.FC<ComponentCardActionsProps> = ({
  component,
  onPreview,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!user) {
      toast.error('You need to be logged in to copy the code');
      return;
    }

    try {
      // Always copy the processed JSON code
      const processedJson = cleanElementorJson(
        component.json_code || component.code || '[]',
        false,
        true,
        false
      );

      await navigator.clipboard.writeText(processedJson);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error processing and copying:', error);
      try {
        await navigator.clipboard.writeText(component.json_code || component.code || '[]');
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (copyError) {
        toast.error('Error copying code');
      }
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreview}
        className="flex-1"
        title="View Component"
      >
        <Eye className="h-4 w-4 mr-1" />
        View Component
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyCode}
        disabled={copied}
        className="flex-1"
        title="Copy Code"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
};

export default ComponentCardActions;
