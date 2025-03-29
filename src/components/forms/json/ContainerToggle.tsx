
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Box } from 'lucide-react';

interface ContainerToggleProps {
  wrapInContainer: boolean;
  onToggleContainer: () => void;
}

const ContainerToggle: React.FC<ContainerToggleProps> = ({
  wrapInContainer,
  onToggleContainer
}) => {
  return (
    <Toggle
      pressed={wrapInContainer}
      onPressedChange={onToggleContainer}
      aria-label="Transformar em Container"
      className="flex items-center gap-1 h-9 px-3"
    >
      <Box size={14} />
      <span>Transformar em Container</span>
    </Toggle>
  );
};

export default ContainerToggle;
