
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Paintbrush } from 'lucide-react';

interface WireframeToggleProps {
  removeStyles: boolean;
  onToggleRemoveStyles: () => void;
}

const WireframeToggle: React.FC<WireframeToggleProps> = ({
  removeStyles,
  onToggleRemoveStyles
}) => {
  return (
    <Toggle
      pressed={removeStyles}
      onPressedChange={onToggleRemoveStyles}
      aria-label="Estilo Wireframe"
      className="flex items-center gap-1 h-9 px-3"
    >
      <Paintbrush size={14} />
      <span>Estilo Wireframe</span>
    </Toggle>
  );
};

export default WireframeToggle;
