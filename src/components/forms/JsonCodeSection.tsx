
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import { validateJson, validateElementorJson, cleanElementorJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import JsonToolsExplanation from './JsonToolsExplanation';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';
import WireframeExample from '../WireframeExample';

// Import the extracted components
import JsonActionsToolbar from './json/JsonActionsToolbar';
import JsonValidityIndicator from './json/JsonValidityIndicator';
import ElementorJsonAlert from './json/ElementorJsonAlert';

interface JsonCodeSectionProps {
  form: UseFormReturn<FormValues>;
  onProcessJson: () => void;
  removeStyles: boolean;
  setRemoveStyles: (value: boolean) => void;
}

const JsonCodeSection: React.FC<JsonCodeSectionProps> = ({ 
  form, 
  onProcessJson,
  removeStyles,
  setRemoveStyles,
}) => {
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidatingJson, setIsValidatingJson] = useState(false);
  const [isElementorJson, setIsElementorJson] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showWireframeExample, setShowWireframeExample] = useState(false);
  
  useEffect(() => {
    const currentJson = form.getValues('jsonCode');
    if (currentJson) {
      setIsValidatingJson(true);
      
      try {
        const isValid = validateJson(currentJson);
        setIsValidJson(isValid);
        
        if (isValid) {
          const jsonObj = JSON.parse(currentJson);
          const isElementor = validateElementorJson(jsonObj);
          setIsElementorJson(isElementor);
        } else {
          setIsElementorJson(false);
        }
      } catch (error) {
        setIsValidJson(false);
        setIsElementorJson(false);
      } finally {
        setIsValidatingJson(false);
      }
    }
  }, [form.watch('jsonCode')]);

  const handleProcessJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast.warning('Nenhum código para processar');
      return;
    }
    
    try {
      if (!validateJson(currentJson)) {
        toast.error('O código não é um JSON válido. Verifique a sintaxe.');
        return;
      }
      
      const parsedJson = JSON.parse(currentJson);
      if (!validateElementorJson(parsedJson)) {
        toast.warning('O JSON não parece ser um componente Elementor válido.');
        return;
      }
      
      const cleanedJson = cleanElementorJson(currentJson, removeStyles);
      form.setValue('jsonCode', cleanedJson);
      
      toast.success(removeStyles 
        ? 'JSON processado com estilo wireframe em preto, branco e azul aplicado!' 
        : 'JSON processado e formatado com sucesso!');
        
      onProcessJson();
    } catch (error) {
      console.error('Erro ao processar JSON:', error);
      toast.error('Erro ao processar o JSON. Verifique o formato.');
    }
  };

  const handleToggleRemoveStyles = () => {
    setRemoveStyles(!removeStyles);
    if (!removeStyles) {
      toast.info('Modo wireframe ativado. Estrutura mantida e estilo limpo em preto, branco e azul aplicado.');
    } else {
      toast.info('Modo wireframe desativado. Estilos originais preservados.');
    }
  };

  const getJsonContent = () => form.getValues('jsonCode');

  const toggleWireframeExample = () => {
    setShowWireframeExample(!showWireframeExample);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="jsonCode"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Código JSON do Elementor*</FormLabel>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  className="text-sm text-primary hover:text-primary/80"
                  onClick={toggleWireframeExample}
                >
                  {showWireframeExample ? 'Ocultar exemplo' : 'Ver exemplo de wireframe'}
                </button>
                <button 
                  type="button" 
                  className="text-sm text-primary hover:text-primary/80"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  {showExplanation ? 'Ocultar explicação' : 'Como usar a ferramenta?'}
                </button>
              </div>
            </div>
            
            {showExplanation && <JsonToolsExplanation />}
            
            {showWireframeExample && (
              <div className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-base">Exemplo de Wireframe</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleWireframeExample} 
                    className="h-7 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Exemplo de como seus componentes ficarão com o estilo wireframe limpo aplicado.
                </p>
                <WireframeExample />
              </div>
            )}
            
            <JsonActionsToolbar
              onProcessJson={handleProcessJson}
              isValidJson={isValidJson}
              isValidating={isValidatingJson}
              removeStyles={removeStyles}
              onToggleRemoveStyles={handleToggleRemoveStyles}
              getJsonContent={getJsonContent}
            />
            
            <FormControl>
              <Textarea 
                placeholder='{"type": "elementor", "elements": [...]}'
                className="min-h-[200px] font-mono text-sm"
                {...field} 
              />
            </FormControl>
            
            <JsonValidityIndicator 
              isValidJson={isValidJson} 
              isElementorJson={isElementorJson}
              hasContent={!!field.value && field.value.length > 0}
              isValidating={isValidatingJson}
            />
            
            {isValidJson && field.value && field.value.length > 0 && !isElementorJson && (
              <ElementorJsonAlert />
            )}
            
            <FormDescription>
              Cole o código JSON do Elementor conforme o exemplo fornecido
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default JsonCodeSection;
