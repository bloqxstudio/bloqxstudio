
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

const JsonTransformer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [removeStyles, setRemoveStyles] = useState(false);
  
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
      // Limpar o JSON com a opção de remover estilos
      const cleanedJson = cleanElementorJson(currentJson, removeStyles);
      form.setValue('jsonCode', cleanedJson);
      
      const successMessage = removeStyles 
        ? 'JSON limpo e formatado com estilo wireframe aplicado!'
        : 'JSON limpo e formatado com sucesso!';
      
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
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={toggleRemoveStyles}
            className={`px-3 py-1 rounded text-sm ${removeStyles 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 border'}`}
          >
            {removeStyles ? 'Wireframe Ativado' : 'Wireframe Desativado'}
          </button>
          <span className="text-xs text-muted-foreground">
            {removeStyles 
              ? "Estilos serão simplificados" 
              : "Manter estilos originais"}
          </span>
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
