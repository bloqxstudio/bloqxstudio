
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
import { AlertCircle, Info } from 'lucide-react';
import JsonActionsToolbar from './json/JsonActionsToolbar';

const JsonTransformer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [removeStyles, setRemoveStyles] = useState(false);
  const [wrapInContainer, setWrapInContainer] = useState(false);
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
      // Limpar o JSON com a opção de remover estilos e envolver em container
      const cleanedJson = cleanElementorJson(currentJson, removeStyles, wrapInContainer);
      form.setValue('jsonCode', cleanedJson);
      
      let successMessage = removeStyles 
        ? 'JSON limpo e formatado com estilo wireframe aplicado!'
        : 'JSON limpo e formatado com sucesso!';
        
      if (wrapInContainer) {
        successMessage = `${successMessage} Transformado em container.`;
      }
      
      toast.success(successMessage);
    } catch (e) {
      console.error('Erro ao processar JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique se é um código válido.');
    }
  };

  const handleJsonLoaded = (jsonContent: string) => {
    form.setValue('jsonCode', jsonContent);
    setActiveTab('edit');
  };

  const toggleRemoveStyles = () => {
    setRemoveStyles(!removeStyles);
    if (!removeStyles) {
      toast.info('Modo wireframe ativado. Ao limpar o JSON, será aplicado estilo wireframe limpo.');
    } else {
      toast.info('Modo wireframe desativado. Os estilos originais serão preservados.');
    }
  };

  const toggleWrapInContainer = () => {
    setWrapInContainer(!wrapInContainer);
    if (!wrapInContainer) {
      toast.info('Modo container ativado. O JSON será envolvido em um container ao processar.');
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
            Você pode colar componentes complexos e nossas ferramentas irão formatá-los para uso no Elementor.
            {removeStyles ? ' O modo wireframe está ativado.' : ' O modo wireframe está desativado.'}
            {wrapInContainer ? ' O modo container está ativado.' : ' O modo container está desativado.'}
          </AlertDescription>
        </Alert>
        
        <JsonActionsToolbar
          onProcessJson={handleProcessJson}
          isValidJson={isValidJson}
          isValidating={isValidating}
          removeStyles={removeStyles}
          onToggleRemoveStyles={toggleRemoveStyles}
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
