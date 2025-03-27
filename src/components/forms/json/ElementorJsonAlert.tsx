
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

const ElementorJsonAlert: React.FC = () => {
  return (
    <Alert variant="destructive" className="mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Formato Incorreto</AlertTitle>
      <AlertDescription>
        Este JSON parece não ser um componente Elementor válido.
        O formato correto deve incluir {'{"type": "elementor"}'} e uma matriz "elements".
      </AlertDescription>
    </Alert>
  );
};

export default ElementorJsonAlert;
