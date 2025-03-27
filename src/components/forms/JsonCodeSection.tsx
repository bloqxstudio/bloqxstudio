
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import ComponentFormActions from './ComponentFormActions';
import CodeViewer from '@/components/CodeViewer';
import { validateJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import JsonToolsExplanation from './JsonToolsExplanation';

interface JsonCodeSectionProps {
  form: UseFormReturn<FormValues>;
  showPreview: boolean;
  previewJson: string;
  onCleanJson: () => void;
  onPreviewJson: () => void;
  removeStyles: boolean;
  setRemoveStyles: (value: boolean) => void;
  wireframeMode: boolean;
  setWireframeMode: (value: boolean) => void;
}

const JsonCodeSection: React.FC<JsonCodeSectionProps> = ({ 
  form, 
  showPreview, 
  previewJson, 
  onCleanJson, 
  onPreviewJson,
  removeStyles,
  setRemoveStyles,
  wireframeMode,
  setWireframeMode
}) => {
  const [isValidJson, setIsValidJson] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  
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
      toast.info('Modo wireframe ativado. Ao limpar o JSON, será aplicado estilo wireframe premium com nomenclatura Client-First.', {
        duration: 3000,
      });
    } else {
      toast.info('Modo wireframe desativado. Os estilos originais serão preservados.', {
        duration: 3000,
      });
    }
  };

  const handleToggleWireframeMode = () => {
    setWireframeMode(!wireframeMode);
    // Provide feedback to the user
    if (!wireframeMode) {
      toast.info('Modo wireframe completo ativado. Textos serão substituídos por placeholders em português, imagens por placeholders, e nomenclatura Client-First será aplicada.', {
        duration: 3000,
      });
    } else {
      toast.info('Modo wireframe completo desativado.', {
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
                {showExplanation ? 'Ocultar explicação' : 'O que são essas ferramentas?'}
              </button>
            </div>
            
            {showExplanation && <JsonToolsExplanation />}
            
            <ComponentFormActions 
              onCleanJson={onCleanJson}
              onPreviewJson={onPreviewJson}
              hasValidJson={isValidJson}
              removeStyles={removeStyles}
              onToggleRemoveStyles={handleToggleRemoveStyles}
              wireframeMode={wireframeMode}
              onToggleWireframeMode={handleToggleWireframeMode}
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
              Cole o código JSON do Elementor aqui
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
