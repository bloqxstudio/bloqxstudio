
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import { validateJson, validateElementorJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import JsonToolsExplanation from './JsonToolsExplanation';
import ProcessJsonButton from './json/ProcessJsonButton';
import JsonCopyButton from './json/JsonCopyButton';
import JsonValidityIndicator from './json/JsonValidityIndicator';
import ElementorJsonAlert from './json/ElementorJsonAlert';

interface JsonCodeSectionProps {
  form: UseFormReturn<FormValues>;
  onProcessJson: () => void;
  simplified?: boolean;
}

const JsonCodeSection: React.FC<JsonCodeSectionProps> = ({ 
  form, 
  onProcessJson,
  simplified = false
}) => {
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidatingJson, setIsValidatingJson] = useState(false);
  const [isElementorJson, setIsElementorJson] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  
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

  const getJsonContent = () => form.getValues('jsonCode');

  return (
    <>
      <FormField
        control={form.control}
        name="jsonCode"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Código JSON do Elementor*</FormLabel>
              {!simplified && (
                <button 
                  type="button" 
                  className="text-sm text-primary hover:text-primary/80"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  {showExplanation ? 'Ocultar explicação' : 'Como usar a ferramenta?'}
                </button>
              )}
            </div>
            
            {showExplanation && !simplified && <JsonToolsExplanation />}
            
            <div className="flex flex-wrap gap-2 mb-2">
              <ProcessJsonButton 
                onProcessJson={onProcessJson} 
                disabled={!isValidJson || isValidatingJson} 
              />
              
              <JsonCopyButton getJsonContent={getJsonContent} />
              
              {!isValidJson && (
                <div className="flex items-center text-destructive gap-1 text-sm ml-2">
                  <span>JSON inválido</span>
                </div>
              )}
            </div>
            
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
