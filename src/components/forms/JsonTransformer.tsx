
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { cleanElementorJson, validateJson } from '@/utils/jsonUtils';
import { toast } from 'sonner';
import JsonFileUploader from './json/JsonFileUploader';
import ClaudeJsonAnalyzer from './ClaudeJsonAnalyzer';
import TemplateGenerator from './json/TemplateGenerator';
import JsonTransformerHeader from './json/JsonTransformerHeader';
import JsonTransformerActions from './json/JsonTransformerActions';
import JsonFormField from './json/JsonFormField';

const JsonTransformer = () => {
  const navigate = useNavigate();
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
    
    setIsProcessing(true);
    
    try {
      // Sempre transformar em container, sem opção de wireframe
      const cleanedJson = cleanElementorJson(currentJson, false, true);
      form.setValue('jsonCode', cleanedJson);
      
      toast.success('JSON transformado em container com sucesso!');
    } catch (e) {
      console.error('Erro ao processar JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique se é um código válido.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateComponent = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson || !isValidJson) {
      toast.error('Por favor, verifique se o JSON é válido antes de criar um componente');
      return;
    }
    
    // Armazenar o JSON processado na sessionStorage para usar na página de criação
    sessionStorage.setItem('processedJson', currentJson);
    
    // Redirecionar para a página de criação de componente
    navigate('/components/new');
    toast.success('JSON processado! Preencha os detalhes do componente');
  };

  const handleJsonLoaded = (jsonContent: string) => {
    form.setValue('jsonCode', jsonContent);
    validateJsonContent(jsonContent);
  };

  const validateJsonContent = (jsonContent: string) => {
    if (!jsonContent.trim()) {
      setIsValidJson(true);
      return;
    }
    
    setIsValidating(true);
    
    try {
      const isValid = validateJson(jsonContent);
      setIsValidJson(isValid);
    } catch (e) {
      setIsValidJson(false);
    } finally {
      setIsValidating(false);
    }
  };

  const getJsonContent = () => form.getValues('jsonCode');

  // Handle template generation
  const handleTemplateGenerated = (template: string) => {
    form.setValue('jsonCode', template);
    validateJsonContent(template);
    toast.success('Template gerado! Você pode editá-lo agora.');
  };

  // Define the handleJsonUpdate function inside the component
  const handleJsonUpdate = (updatedJson: string) => {
    form.setValue('jsonCode', updatedJson);
    toast.success('JSON atualizado com as sugestões do Claude');
  };

  return (
    <Card className="border shadow-sm">
      <JsonTransformerHeader />
      
      <CardContent>
        {/* File uploader at the beginning */}
        <div className="mb-6">
          <JsonFileUploader onJsonLoaded={handleJsonLoaded} />
        </div>
        
        <JsonTransformerActions 
          onProcessJson={handleProcessJson}
          getJsonContent={getJsonContent}
          onCreateComponent={handleCreateComponent}
          isValidJson={isValidJson}
          isValidating={isValidating}
          isProcessing={isProcessing}
        />
        
        <TemplateGenerator onTemplateGenerated={handleTemplateGenerated} />
        
        <Form {...form}>
          <JsonFormField 
            form={form} 
            onJsonChange={validateJsonContent} 
          />
        </Form>
        
        {isValidJson && form.getValues('jsonCode') && (
          <div className="mt-4">
            <ClaudeJsonAnalyzer 
              jsonCode={form.getValues('jsonCode')}
              onJsonUpdate={handleJsonUpdate}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JsonTransformer;
