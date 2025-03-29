
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import { validateJson, validateElementorJson } from '@/utils/jsonUtils';
import JsonToolsExplanation from './JsonToolsExplanation';
import ProcessJsonButton from './json/ProcessJsonButton';
import JsonCopyButton from './json/JsonCopyButton';
import JsonValidityIndicator from './json/JsonValidityIndicator';
import ElementorJsonAlert from './json/ElementorJsonAlert';

interface JsonCodeSectionProps {
  form: UseFormReturn<FormValues> | UseFormReturn<any>;
  onProcessJson: () => void;
  simplified?: boolean;
  onContentChange?: (content: string) => void;
}

const JsonCodeSection: React.FC<JsonCodeSectionProps> = ({ 
  form, 
  onProcessJson,
  simplified = false,
  onContentChange
}) => {
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidatingJson, setIsValidatingJson] = useState(false);
  const [isElementorJson, setIsElementorJson] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  
  useEffect(() => {
    // Initial validation on component mount
    const initialValue = form.getValues('jsonCode');
    if (initialValue) {
      setJsonContent(initialValue);
      validateJsonContent(initialValue);
    }
  }, [form]);
  
  const validateJsonContent = (content: string) => {
    if (!content) {
      setIsValidJson(true); // Empty is considered valid initially
      setIsElementorJson(true);
      return;
    }
    
    setIsValidatingJson(true);
    
    try {
      const isValid = validateJson(content);
      setIsValidJson(isValid);
      
      if (isValid) {
        const jsonObj = JSON.parse(content);
        const isElementor = validateElementorJson(jsonObj);
        setIsElementorJson(isElementor);
      } else {
        setIsElementorJson(false);
      }
      
      // Call the onContentChange callback if provided
      if (onContentChange) {
        onContentChange(content);
      }
    } catch (error) {
      setIsValidJson(false);
      setIsElementorJson(false);
      console.error('Error validating JSON:', error);
    } finally {
      setIsValidatingJson(false);
    }
  };

  const getJsonContent = () => form.getValues('jsonCode');

  return (
    <>
      <FormField
        control={form.control}
        name="jsonCode"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Código JSON do Elementor{simplified ? '' : '*'}</FormLabel>
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
                loading={isValidatingJson}
              />
              
              <JsonCopyButton getJsonContent={getJsonContent} />
              
              {!isValidJson && jsonContent && (
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
                onChange={(e) => {
                  field.onChange(e);
                  setJsonContent(e.target.value);
                  validateJsonContent(e.target.value);
                }}
              />
            </FormControl>
            
            <JsonValidityIndicator 
              isValidJson={isValidJson} 
              isElementorJson={isElementorJson}
              hasContent={!!jsonContent}
              isValidating={isValidatingJson}
            />
            
            {isValidJson && jsonContent && !isElementorJson && (
              <ElementorJsonAlert />
            )}
            
            <FormDescription>
              Cole o código JSON do Elementor para transformá-lo em container
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default JsonCodeSection;
