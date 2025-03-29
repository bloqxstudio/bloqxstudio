
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import JsonFileUploader from './json/JsonFileUploader';
import JsonCodeSection from './JsonCodeSection';
import { formSchema } from './componentFormSchema';
import { cleanElementorJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';

const JsonTransformer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  
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
      // Limpar o JSON com a opção de remover estilos como false
      const cleanedJson = cleanElementorJson(currentJson, false);
      form.setValue('jsonCode', cleanedJson);
      
      toast.success('JSON limpo e formatado com sucesso!');
    } catch (e) {
      console.error('Erro ao processar JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique se é um código válido.');
    }
  };

  const handleJsonLoaded = (jsonContent: string) => {
    form.setValue('jsonCode', jsonContent);
    setActiveTab('edit');
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
              />
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JsonTransformer;
