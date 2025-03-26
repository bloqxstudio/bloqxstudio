
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import ComponentFormActions from './ComponentFormActions';
import { validateJson, cleanElementorJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import ElementorPreview from '@/components/ElementorPreview';

interface JsonCodeSectionProps {
  form: UseFormReturn<FormValues>;
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
  onCleanJson: () => void;
  removeStyles: boolean;
  setRemoveStyles: (value: boolean) => void;
}

const JsonCodeSection: React.FC<JsonCodeSectionProps> = ({ 
  form, 
  showPreview,
  setShowPreview,
  onCleanJson, 
  removeStyles,
  setRemoveStyles
}) => {
  const [isValidJson, setIsValidJson] = useState(true);
  
  // Validate JSON whenever it changes
  useEffect(() => {
    const currentJson = form.getValues('jsonCode');
    if (currentJson) {
      const isValid = validateJson(currentJson);
      setIsValidJson(isValid);
    }
  }, [form.watch('jsonCode')]);

  const handleToggleRemoveStyles = () => {
    setRemoveStyles(!removeStyles);
    // Provide feedback to the user
    if (!removeStyles) {
      toast.info('Estilo wireframe ativado. Textos serão genéricos, cores em tons de cinza, e elementos terão nomes amigáveis.', {
        duration: 3000,
      });
      
      // If style is now enabled, set a note in the description field
      const currentDescription = form.getValues('description');
      if (currentDescription && !currentDescription.includes('[WIREFRAME]')) {
        form.setValue('description', `[WIREFRAME] ${currentDescription}`);
      } else if (!currentDescription) {
        form.setValue('description', '[WIREFRAME] Componente em estilo wireframe');
      }
      
      // Clean and apply wireframe style immediately
      const currentJson = form.getValues('jsonCode');
      if (validateJson(currentJson)) {
        const processedJson = cleanElementorJson(currentJson, true);
        form.setValue('jsonCode', processedJson);
        toast.success('JSON convertido para estilo wireframe!');
      }
    } else {
      toast.info('Estilo wireframe desativado.', {
        duration: 3000,
      });
      
      // Remove the wireframe tag if present
      const currentDescription = form.getValues('description');
      if (currentDescription && currentDescription.includes('[WIREFRAME]')) {
        form.setValue('description', currentDescription.replace('[WIREFRAME] ', ''));
      }
    }
  };

  const handleCleanJson = () => {
    const currentJson = form.getValues('jsonCode');
    if (validateJson(currentJson)) {
      // Apply wireframe style and clean the code right away
      const processedJson = removeStyles ? cleanElementorJson(currentJson, true) : cleanElementorJson(currentJson, false);
      form.setValue('jsonCode', processedJson);
      toast.success('JSON limpo e formatado com sucesso!');
    } else {
      toast.error('JSON inválido. Verifique a sintaxe antes de limpar.');
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="jsonCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código JSON do Elementor*</FormLabel>
            <ComponentFormActions 
              onCleanJson={handleCleanJson}
              hasValidJson={isValidJson}
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
                    const isValid = validateJson(e.target.value);
                    setIsValidJson(isValid);
                    if (!isValid && e.target.value.length > 0) {
                      form.setError('jsonCode', { 
                        type: 'manual', 
                        message: 'JSON inválido. Verifique a sintaxe.'
                      });
                    } else {
                      form.clearErrors('jsonCode');
                    }
                  }
                }}
              />
            </FormControl>
            <FormDescription>
              {removeStyles 
                ? 'Cole o código JSON do Elementor aqui - Estilo wireframe ativado'
                : 'Cole o código JSON do Elementor aqui'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {showPreview && validateJson(form.getValues('jsonCode')) && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Visualização</h3>
          <ElementorPreview jsonContent={form.getValues('jsonCode')} />
        </div>
      )}
    </>
  );
};

export default JsonCodeSection;
