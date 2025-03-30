
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Textarea, Button, Toggle } from '@/components/ui';
import { Wand2, Paintbrush, Copy, Check, AlertCircle } from 'lucide-react';
import { cleanElementorJson, validateJson } from '@/utils/json';

interface JsonCodeEditorProps {
  form: UseFormReturn<any>;
  removeStyles: boolean;
  setRemoveStyles: (value: boolean) => void;
}

const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({ 
  form, 
  removeStyles, 
  setRemoveStyles 
}) => {
  const [copied, setCopied] = useState(false);
  const [isValidJson, setIsValidJson] = useState(true);
  const [isElementorCopied, setElementorCopied] = useState(false);
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  // Check JSON validity when code changes
  React.useEffect(() => {
    const currentCode = form.getValues('code');
    if (currentCode) {
      try {
        setIsValidJson(validateJson(currentCode));
      } catch (e) {
        setIsValidJson(false);
      }
    }
  }, [form.watch('code')]);

  const handleCleanJson = () => {
    const currentCode = form.getValues('code');
    
    if (!currentCode) {
      toast(getTranslation(
        'No code to clean',
        'Nenhum código para limpar'
      ));
      return;
    }
    
    try {
      if (!validateJson(currentCode)) {
        toast.error(getTranslation(
          'The code is not valid JSON. Check the syntax.',
          'O código não é um JSON válido. Verifique a sintaxe.'
        ));
        return;
      }
      
      const cleanedJson = cleanElementorJson(currentCode, removeStyles);
      form.setValue('code', cleanedJson);
      
      const successMessage = removeStyles 
        ? getTranslation(
            'JSON cleaned and formatted with wireframe style applied!',
            'JSON limpo e formatado com estilo wireframe aplicado!'
          ) 
        : getTranslation(
            'JSON cleaned and formatted successfully!',
            'JSON limpo e formatado com sucesso!'
          );
      
      toast.success(successMessage);
    } catch (e) {
      console.error('Error cleaning JSON:', e);
      toast.error(getTranslation(
        'Error processing JSON. Check if it is valid code.',
        'Erro ao processar o JSON. Verifique se é um código válido.'
      ));
    }
  };

  const handleToggleRemoveStyles = () => {
    setRemoveStyles(!removeStyles);
    if (!removeStyles) {
      toast.info(getTranslation(
        'Wireframe mode activated. When cleaning JSON, clean wireframe style will be applied.',
        'Modo wireframe ativado. Ao limpar o JSON, será aplicado estilo wireframe limpo.'
      ));
    } else {
      toast.info(getTranslation(
        'Wireframe mode deactivated. Original styles will be preserved.',
        'Modo wireframe desativado. Os estilos originais serão preservados.'
      ));
    }
  };

  const handleCopyToClipboard = () => {
    const currentCode = form.getValues('code');
    
    if (!currentCode) {
      toast.warning(getTranslation(
        'No code to copy',
        'Nenhum código para copiar'
      ));
      return;
    }
    
    try {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      toast.success(getTranslation(
        'Code copied to clipboard! You can paste into Elementor to test.',
        'Código copiado para área de transferência! Você pode colar no Elementor para testar.'
      ));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error(getTranslation(
        'Error copying to clipboard.',
        'Erro ao copiar para área de transferência.'
      ));
    }
  };

  const handleCopyForElementor = () => {
    const currentCode = form.getValues('code');
    
    if (!currentCode || !isValidJson) {
      toast.warning(getTranslation(
        'Cannot copy invalid JSON for Elementor',
        'Não é possível copiar JSON inválido para o Elementor'
      ));
      return;
    }
    
    try {
      navigator.clipboard.writeText(currentCode);
      setElementorCopied(true);
      toast.success(
        getTranslation(
          'Copied to clipboard! Paste directly into Elementor',
          'Copiado para área de transferência! Cole diretamente no Elementor'
        ),
        {
          icon: <Copy className="h-4 w-4" />,
          duration: 4000
        }
      );
      setTimeout(() => setElementorCopied(false), 2000);
    } catch (error) {
      console.error('Error copying for Elementor:', error);
      toast.error(getTranslation(
        'Error copying to clipboard.',
        'Erro ao copiar para área de transferência.'
      ));
    }
  };

  return (
    <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {getTranslation('Code', 'Código')}
          </FormLabel>
          <div className="space-y-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleCleanJson}
                className="gap-1"
                title={getTranslation(
                  'Cleans the JSON, removes unnecessary properties and formats the code',
                  'Limpa o JSON, remove propriedades desnecessárias e formata o código'
                )}
              >
                <Wand2 className="h-4 w-4" />
                {getTranslation('Clean and Format', 'Limpar e Formatar')}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="gap-1"
                title={getTranslation(
                  'Copy JSON to test in Elementor',
                  'Copiar JSON para testar no Elementor'
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 
                  getTranslation('Copied!', 'Copiado!') : 
                  getTranslation('Copy to test', 'Copiar para testar')
                }
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyForElementor}
                disabled={!isValidJson}
                className="gap-1 border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                title={getTranslation(
                  'Copy for direct use in Elementor',
                  'Copiar para uso direto no Elementor'
                )}
              >
                {isElementorCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {isElementorCopied ? 
                  getTranslation('Copied!', 'Copiado!') : 
                  getTranslation('Copy for Elementor', 'Copiar para Elementor')
                }
              </Button>
              
              {!isValidJson && field.value && (
                <div className="flex items-center text-destructive gap-1 ml-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {getTranslation('Invalid JSON', 'JSON inválido')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Toggle 
                pressed={removeStyles}
                onPressedChange={handleToggleRemoveStyles}
                className="gap-1 text-xs"
                title={getTranslation(
                  'Apply clean wireframe style',
                  'Aplicar estilo wireframe clean'
                )}
              >
                <Paintbrush className="h-4 w-4" />
                {getTranslation('Wireframe Style', 'Estilo Wireframe')}
              </Toggle>
              <span className="text-xs text-muted-foreground">
                {removeStyles 
                  ? getTranslation(
                      "Clean wireframe in black, white and blue",
                      "Wireframe clean em preto, branco e azul"
                    )
                  : getTranslation(
                      "Keep original styles",
                      "Manter estilos originais"
                    )
                }
              </span>
            </div>
          </div>
          <FormControl>
            <Textarea 
              placeholder={getTranslation(
                "Component code", 
                "Código do componente"
              )}
              {...field} 
              rows={12}
              className="font-mono text-xs"
            />
          </FormControl>
          <FormDescription className="mt-1">
            {getTranslation(
              'Paste the Elementor component code for processing',
              'Cole o código do componente Elementor para processamento'
            )}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default JsonCodeEditor;
