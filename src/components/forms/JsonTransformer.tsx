
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import JsonFileUploader from './json/JsonFileUploader';
import { cleanElementorJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { Info } from 'lucide-react';
import JsonCopyButton from './json/JsonCopyButton';
import ProcessJsonButton from './json/ProcessJsonButton';
import ClaudeJsonAnalyzer from './ClaudeJsonAnalyzer';

const JsonTransformer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  
  const form = useForm({
    defaultValues: {
      jsonCode: '',
    }
  });

  const handleProcessJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast.warning('Nenhum código para processar');
      return;
    }
    
    try {
      // Sempre transformar em container, sem opção de wireframe
      const cleanedJson = cleanElementorJson(currentJson, false, true);
      form.setValue('jsonCode', cleanedJson);
      
      toast.success('JSON processado e transformado em container com sucesso!');
    } catch (e) {
      console.error('Erro ao processar JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique se é um código válido.');
    }
  };

  const handleJsonLoaded = (jsonContent: string) => {
    form.setValue('jsonCode', jsonContent);
    setActiveTab('edit');
  };

  const validateJsonContent = (jsonContent: string) => {
    setIsValidJson(jsonContent.trim() !== '' && isJsonValid(jsonContent));
  };

  const isJsonValid = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const getJsonContent = () => form.getValues('jsonCode');
  
  const handleJsonUpdate = (updatedJson: string) => {
    form.setValue('jsonCode', updatedJson);
    toast.success('JSON atualizado com as sugestões do Claude');
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Transformador de JSON do Elementor</CardTitle>
        <CardDescription>
          Faça upload do JSON do Elementor, transforme e copie para utilizar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert variant="default" className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Dica de uso</AlertTitle>
          <AlertDescription>
            Você pode colar componentes complexos e nossa ferramenta irá transformá-los em containers para uso no Elementor.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <ProcessJsonButton 
            onProcessJson={handleProcessJson} 
            disabled={!isValidJson || isValidating} 
          />
          
          <JsonCopyButton getJsonContent={getJsonContent} />
          
          {!isValidJson && (
            <div className="flex items-center text-destructive gap-1 text-sm ml-2">
              <span>JSON inválido</span>
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
            <TabsTrigger value="edit">Editar JSON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <JsonFileUploader onJsonLoaded={handleJsonLoaded} />
          </TabsContent>
          
          <TabsContent value="edit" className="mt-0">
            <Form {...form}>
              <FormField
                control={form.control}
                name="jsonCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código JSON do Elementor</FormLabel>
                    
                    <FormControl>
                      <Textarea 
                        placeholder='{"type": "elementor", "elements": [...]}'
                        className="min-h-[200px] font-mono text-sm"
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          validateJsonContent(e.target.value);
                        }}
                      />
                    </FormControl>
                    
                    <FormDescription>
                      Cole o código JSON do Elementor para transformá-lo em container
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
            
            {isValidJson && form.getValues('jsonCode') && (
              <ClaudeJsonAnalyzer 
                jsonCode={form.getValues('jsonCode')}
                onJsonUpdate={handleJsonUpdate}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JsonTransformer;
