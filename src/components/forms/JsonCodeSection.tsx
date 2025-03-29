
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { validateJson } from '@/utils/jsonUtils';
import JsonToolsExplanation from './JsonToolsExplanation';
import ProcessJsonButton from './json/ProcessJsonButton';
import JsonCopyButton from './json/JsonCopyButton';
import JsonValidityIndicator from './json/JsonValidityIndicator';
import JsonFileUploader from './json/JsonFileUploader';
import TemplateGenerator from './json/TemplateGenerator';

interface JsonCodeSectionProps {
  form: UseFormReturn<any>;
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
  const [showExplanation, setShowExplanation] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  
  useEffect(() => {
    // Initial validation on component mount
    const initialValue = form.getValues('jsonCode');
    if (initialValue) {
      setJsonContent(initialValue);
      validateJsonContent(initialValue);
    }
  }, []);
  
  const validateJsonContent = (content: string) => {
    if (!content) {
      setIsValidJson(true); // Empty is considered valid initially
      return;
    }
    
    setIsValidatingJson(true);
    
    try {
      const isValid = validateJson(content);
      setIsValidJson(isValid);
      
      // Call the onContentChange callback if provided
      if (onContentChange) {
        onContentChange(content);
      }
    } catch (error) {
      setIsValidJson(false);
      console.error('Error validating JSON:', error);
    } finally {
      setIsValidatingJson(false);
    }
  };

  const getJsonContent = () => form.getValues('jsonCode');
  
  const handleTemplateGenerated = (template: string) => {
    form.setValue('jsonCode', template);
    setJsonContent(template);
    validateJsonContent(template);
  };

  const handleJsonFileUploaded = (jsonContent: string) => {
    form.setValue('jsonCode', jsonContent);
    setJsonContent(jsonContent);
    validateJsonContent(jsonContent);
  };

  return (
    <>
      {!simplified && (
        <>
          <JsonFileUploader onJsonLoaded={handleJsonFileUploaded} />

          <div className="mt-6 mb-6">
            <TemplateGenerator onTemplateGenerated={handleTemplateGenerated} />
          </div>
        </>
      )}
    
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
                value={field.value}
                onChange={(e) => {
                  field.onChange(e);
                  setJsonContent(e.target.value);
                  validateJsonContent(e.target.value);
                }}
              />
            </FormControl>
            
            <JsonValidityIndicator 
              isValidJson={isValidJson} 
              hasContent={!!jsonContent}
              isValidating={isValidatingJson}
            />
            
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
