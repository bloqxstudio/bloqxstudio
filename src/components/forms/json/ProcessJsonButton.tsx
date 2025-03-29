
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface ProcessJsonButtonProps {
  onProcessJson: () => void;
  disabled: boolean;
}

const ProcessJsonButton: React.FC<ProcessJsonButtonProps> = ({
  onProcessJson,
  disabled
}) => {
  return (
    <Button 
      type="button" 
      variant="default" 
      size="sm"
      onClick={onProcessJson}
      disabled={disabled}
      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
    >
      <Wand2 size={14} />
      <span>Transformar em Container</span>
    </Button>
  );
};

export default ProcessJsonButton;
