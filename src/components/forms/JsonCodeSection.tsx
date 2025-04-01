
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';
import { validateJson } from '@/utils/json';
import JsonToolsExplanation from './JsonToolsExplanation';
import JsonActionsToolbar from './json/JsonActionsToolbar';
import JsonValidityIndicator from './json/JsonValidityIndicator';
import JsonFileUploader from './json/JsonFileUploader';

interface JsonCodeSectionProps {
  form: UseFormReturn<any>;
  onProcessJson: () => void;
  simplified?: boolean;
  onContentChange?: (content: string) => void;
  applyStructure?: boolean;
  setApplyStructure?: (value: boolean) => void;
}

const JsonCodeSection: React.FC<JsonCodeSectionProps> = ({ 
  form, 
  onProcessJson,
  simplified = false,
  onContentChange,
  applyStructure = false,
  setApplyStructure
}) => {
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidatingJson, setIsValidatingJson] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };
  
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
  
  const handleJsonFileUploaded = (jsonContent: string) => {
    form.setValue('jsonCode', jsonContent);
    setJsonContent(jsonContent);
    validateJsonContent(jsonContent);
  };

  // Função para formatar JSON para exibição
  const formatJsonForDisplay = (json: string): string => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch (e) {
      return json;
    }
  };

  return (
    <>
      {!simplified && (
        <JsonFileUploader onJsonLoaded={handleJsonFileUploaded} />
      )}
    
      {/* Structure toggle */}
      {setApplyStructure && (
        <div className="flex items-center space-x-4 mb-4">
          <Switch
            id="apply-structure-toggle"
            checked={applyStructure}
            onCheckedChange={setApplyStructure}
          />
          <Label htmlFor="apply-structure-toggle" className="font-medium">
            {getTranslation(
              'Apply Standard Structure',
              'Aplicar Estrutura Padrão'
            )}
          </Label>
        </div>
      )}

      {applyStructure && (
        <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-sm text-gray-600">
            {getTranslation(
              'Standard structure will be applied: Section → Padding → Row → Column → Content Groups → Widgets',
              'A estrutura padrão será aplicada: Seção → Padding → Linha → Coluna → Grupos de Conteúdo → Widgets'
            )}
          </p>
        </div>
      )}
    
      <FormField
        control={form.control}
        name="jsonCode"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>
                {getTranslation(
                  'Elementor JSON Code',
                  'Código JSON do Elementor'
                )}
                {simplified ? '' : '*'}
              </FormLabel>
              {!simplified && (
                <button 
                  type="button" 
                  className="text-sm text-primary hover:text-primary/80"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  {showExplanation ? 
                    getTranslation('Hide explanation', 'Ocultar explicação') :
                    getTranslation('How to use the tool?', 'Como usar a ferramenta?')
                  }
                </button>
              )}
            </div>
            
            {showExplanation && !simplified && <JsonToolsExplanation />}
            
            <JsonActionsToolbar 
              onProcessJson={onProcessJson} 
              isValidJson={isValidJson}
              isValidating={isValidatingJson}
              getJsonContent={getJsonContent}
              showElementorCopy={true}
            />
            
            <FormControl>
              <Textarea 
                placeholder='{"type": "elementor", "elements": [...]}'
                className="min-h-[200px] font-mono text-sm"
                value={field.value ? formatJsonForDisplay(field.value) : ''}
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
              {getTranslation(
                'Paste the Elementor JSON code to transform it into a valid JSON',
                'Cole o código JSON do Elementor para transformá-lo em Json Válido'
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default JsonCodeSection;
