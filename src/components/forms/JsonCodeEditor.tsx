
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
import { Wand2, Paintbrush, Copy, Check } from 'lucide-react';
import { cleanElementorJson, validateJson } from '@/utils/jsonUtils';

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

  const handleCleanJson = () => {
    const currentCode = form.getValues('code');
    
    if (!currentCode) {
      toast('Nenhum código para limpar');
      return;
    }
    
    try {
      if (!validateJson(currentCode)) {
        toast.error('O código não é um JSON válido. Verifique a sintaxe.');
        return;
      }
      
      const cleanedJson = cleanElementorJson(currentCode, removeStyles);
      form.setValue('code', cleanedJson);
      
      const successMessage = removeStyles 
        ? 'JSON limpo e formatado com estilo wireframe premium e nomenclatura Client-First!'
        : 'JSON limpo e formatado com sucesso!';
      
      toast.success(successMessage);
    } catch (e) {
      console.error('Error cleaning JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique se é um código válido.');
    }
  };

  const handleToggleRemoveStyles = () => {
    setRemoveStyles(!removeStyles);
    if (!removeStyles) {
      toast.info('Modo wireframe ativado. Ao limpar o JSON, será aplicado estilo wireframe premium com nomenclatura Client-First.');
    } else {
      toast.info('Modo wireframe desativado. Os estilos originais serão preservados.');
    }
  };

  const handleCopyToClipboard = () => {
    const currentCode = form.getValues('code');
    
    if (!currentCode) {
      toast.warning('Nenhum código para copiar');
      return;
    }
    
    try {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      toast.success('Código copiado para área de transferência! Você pode colar no Elementor para testar.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar para área de transferência:', error);
      toast.error('Erro ao copiar para área de transferência.');
    }
  };

  return (
    <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Código</FormLabel>
          <div className="space-y-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleCleanJson}
                className="gap-1"
                title="Limpa o JSON, remove propriedades desnecessárias e formata o código"
              >
                <Wand2 className="h-4 w-4" />
                Limpar e Formatar
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="gap-1"
                title="Copiar JSON para testar no Elementor"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar para testar'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Toggle 
                pressed={removeStyles}
                onPressedChange={handleToggleRemoveStyles}
                className="gap-1 text-xs"
                title="Aplicar estilo de wireframe premium e nomenclatura Client-First"
              >
                <Paintbrush className="h-4 w-4" />
                Estilo Wireframe
              </Toggle>
              <span className="text-xs text-muted-foreground">
                {removeStyles 
                  ? "Wireframe com nomenclatura Client-First" 
                  : "Manter estilos originais"}
              </span>
            </div>
          </div>
          <FormControl>
            <Textarea 
              placeholder="Código do componente" 
              {...field} 
              rows={12}
              className="font-mono text-xs"
            />
          </FormControl>
          <FormDescription>
            Cole o código do componente
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default JsonCodeEditor;
