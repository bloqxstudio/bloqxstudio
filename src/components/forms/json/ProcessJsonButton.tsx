
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';

interface ProcessJsonButtonProps {
  onProcessJson: () => void;
  disabled: boolean;
  loading?: boolean;
}

const ProcessJsonButton: React.FC<ProcessJsonButtonProps> = ({
  onProcessJson,
  disabled,
  loading = false
}) => {
  return (
    <Button 
      type="button" 
      variant="default" 
      size="sm"
      onClick={onProcessJson}
      disabled={disabled || loading}
      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Wand2 size={14} />
      )}
      <span>{loading ? 'Processando...' : 'Transformar em Container'}</span>
    </Button>
  );
};

export default ProcessJsonButton;
