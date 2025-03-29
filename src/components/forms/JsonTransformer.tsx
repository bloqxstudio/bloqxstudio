
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import JsonFileUploader from './json/JsonFileUploader';
import JsonCodeSection from './JsonCodeSection';
import { cleanElementorJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { Info } from 'lucide-react';
import JsonActionsToolbar from './json/JsonActionsToolbar';

const JsonTransformer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [wrapInContainer, setWrapInContainer] = useState(true);
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
      // Limpar o JSON com a opção de envolver em container sempre ativada
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

  const toggleWrapInContainer = () => {
    setWrapInContainer(!wrapInContainer);
    if (!wrapInContainer) {
      toast.info('Modo container ativado. O JSON será transformado em container ao processar.');
    } else {
      toast.info('Modo container desativado. A estrutura original será mantida.');
    }
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
        
        <JsonActionsToolbar
          onProcessJson={handleProcessJson}
          isValidJson={isValidJson}
          isValidating={isValidating}
          wrapInContainer={wrapInContainer}
          onToggleContainer={toggleWrapInContainer}
          getJsonContent={getJsonContent}
        />
        
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
              <JsonCodeSection 
                form={form} 
                onProcessJson={handleProcessJson} 
                simplified={true}
                onContentChange={validateJsonContent}
              />
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JsonTransformer;
