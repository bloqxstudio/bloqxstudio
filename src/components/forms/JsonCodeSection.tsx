import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { validateJson, validateElementorJson, cleanElementorJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import JsonToolsExplanation from './JsonToolsExplanation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { Check, AlertCircle, Wand2, Paintbrush, Copy } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  
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
        ? 'JSON processado com estilo wireframe aplicado!' 
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
      toast.info('Modo wireframe ativado. Estrutura mantida e estilos padronizados.');
    } else {
      toast.info('Modo wireframe desativado. Estilos originais preservados.');
    }
  };

  const handleCopyToClipboard = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast.warning('Nenhum código para copiar');
      return;
    }
    
    try {
      navigator.clipboard.writeText(currentJson);
      setCopied(true);
      toast.success('Código copiado para área de transferência! Cole no Elementor para testar.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar para área de transferência:', error);
      toast.error('Erro ao copiar para área de transferência.');
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
            
            <div className="flex flex-wrap gap-2 mb-2">
              <Button 
                type="button" 
                variant="default" 
                size="sm"
                onClick={handleProcessJson}
                disabled={!isValidJson || isValidatingJson}
                className="flex items-center gap-1"
              >
                <Wand2 size={14} />
                <span>Processar JSON</span>
              </Button>
              
              <Toggle
                pressed={removeStyles}
                onPressedChange={handleToggleRemoveStyles}
                aria-label="Estilo Wireframe"
                className="flex items-center gap-1 h-9 px-3"
              >
                <Paintbrush size={14} />
                <span>Estilo Wireframe</span>
              </Toggle>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copiado!' : 'Copiar para Elementor'}</span>
              </Button>

              {!isValidJson && field.value && field.value.length > 0 && (
                <div className="flex items-center text-destructive gap-1 text-sm ml-2">
                  <AlertCircle size={14} />
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
    </>
  );
};

export default JsonCodeSection;
