
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { Info } from 'lucide-react';

const JsonTransformerHeader: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl">Transformador de JSON do Elementor</CardTitle>
        <CardDescription>
          Faça upload do JSON do Elementor, transforme e crie um componente
        </CardDescription>
      </CardHeader>
      
      <Alert variant="default" className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Dica de uso</AlertTitle>
        <AlertDescription>
          Você pode colar componentes complexos e nossa ferramenta irá transformá-los em containers para uso no Elementor.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default JsonTransformerHeader;
