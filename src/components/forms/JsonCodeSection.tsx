
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import ComponentFormActions from './ComponentFormActions';
import CodeViewer from '@/components/CodeViewer';
import { validateJson, validateElementorJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import JsonToolsExplanation from './JsonToolsExplanation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { Check, AlertCircle } from 'lucide-react';

interface JsonCodeSectionProps {
  form: UseFormReturn<FormValues>;
  showPreview: boolean;
  previewJson: string;
  onProcessJson: () => void;
  removeStyles: boolean;
  setRemoveStyles: (value: boolean) => void;
}

const JsonCodeSection: React.FC<JsonCodeSectionProps> = ({ 
  form, 
  showPreview, 
  previewJson, 
  onProcessJson,
  removeStyles,
  setRemoveStyles,
}) => {
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidatingJson, setIsValidatingJson] = useState(false);
  const [isElementorJson, setIsElementorJson] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Validate JSON whenever it changes
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

  const handleToggleRemoveStyles = () => {
    setRemoveStyles(!removeStyles);
    // Provide feedback to the user
    if (!removeStyles) {
      toast.info('Modo wireframe ativado. Estrutura do componente será mantida e estilos serão padronizados.', {
        duration: 3000,
      });
    } else {
      toast.info('Modo wireframe desativado. Os estilos originais serão preservados.', {
        duration: 3000,
      });
    }
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
              <button 
                type="button" 
                className="text-sm text-primary hover:text-primary/80"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? 'Ocultar explicação' : 'Como usar a ferramenta?'}
              </button>
            </div>
            
            {showExplanation && <JsonToolsExplanation />}
            
            <ComponentFormActions 
              onProcessJson={onProcessJson}
              hasValidJson={isValidJson}
              isValidating={isValidatingJson}
              removeStyles={removeStyles}
              onToggleRemoveStyles={handleToggleRemoveStyles}
            />
            
            <FormControl>
              <Textarea 
                placeholder='{"type": "elementor", "elements": [...]}'
                className="min-h-[200px] font-mono text-sm"
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  // Immediate validation feedback for large changes
                  if (e.target.value.length > 50) {
                    try {
                      const isValid = validateJson(e.target.value);
                      setIsValidJson(isValid);
                      if (!isValid && e.target.value.length > 0) {
                        form.setError('jsonCode', { 
                          type: 'manual', 
                          message: 'JSON inválido. Verifique a sintaxe.'
                        });
                      } else {
                        form.clearErrors('jsonCode');
                        
                        // Validate if it's an Elementor JSON
                        if (isValid) {
                          const jsonObj = JSON.parse(e.target.value);
                          const isElementor = validateElementorJson(jsonObj);
                          setIsElementorJson(isElementor);
                        }
                      }
                    } catch (error) {
                      setIsValidJson(false);
                      setIsElementorJson(false);
                      form.setError('jsonCode', { 
                        type: 'manual', 
                        message: 'JSON inválido. Verifique a sintaxe.'
                      });
                    }
                  }
                }}
              />
            </FormControl>
            
            {isValidJson && field.value && field.value.length > 0 && (
              <div className="mt-2 flex items-center text-green-600 gap-1 text-sm">
                <Check size={16} />
                <span>JSON válido</span>
                
                {!isElementorJson && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Formato Incorreto</AlertTitle>
                    <AlertDescription>
                      Este JSON parece não ser um componente Elementor válido.
                      O formato correto deve incluir {'{"type": "elementor"}'} e uma matriz "elements".
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            <FormDescription>
              Cole o código JSON do Elementor conforme o exemplo fornecido
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {showPreview && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-lg font-medium mb-3">Pré-visualização:</h3>
          <CodeViewer code={previewJson} title="JSON Formatado" />
        </div>
      )}
    </>
  );
};

export default JsonCodeSection;
