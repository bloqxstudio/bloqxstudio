import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { validateJson, getStandardTransformedJson } from '@/utils/json';
import { toast } from 'sonner';
import JsonFileUploader from './json/JsonFileUploader';
import ClaudeJsonAnalyzer from './ClaudeJsonAnalyzer';
import JsonTransformerHeader from './json/JsonTransformerHeader';
import JsonActionsToolbar from './json/JsonActionsToolbar';
import JsonFormField from './json/JsonFormField';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const JsonTransformer = () => {
  const navigate = useNavigate();
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [applyStructure, setApplyStructure] = useState(true); // Default to true for standard transformation
  
  // Get language preference
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };
  
  const form = useForm({
    defaultValues: {
      jsonCode: '',
    }
  });

  const handleProcessJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast.warning(getTranslation(
        'No code to process',
        'Nenhum código para processar'
      ));
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Use the centralized transformation function
      const transformedJson = getStandardTransformedJson(currentJson);
      form.setValue('jsonCode', transformedJson);
      
      toast.success(getTranslation(
        'JSON transformed with standard structure successfully!',
        'JSON transformado com estrutura padrão com sucesso!'
      ));
    } catch (e) {
      console.error('Error processing JSON:', e);
      toast.error(getTranslation(
        'Error processing JSON. Please check if it is valid code.',
        'Erro ao processar o JSON. Verifique se é um código válido.'
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateComponent = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson || !isValidJson) {
      toast.error(getTranslation(
        'Please check if the JSON is valid before creating a component',
        'Por favor, verifique se o JSON é válido antes de criar um componente'
      ));
      return;
    }
    
    // Store the processed JSON in sessionStorage for use on the component creation page
    sessionStorage.setItem('processedJson', currentJson);
    
    // Redirect to the component creation page
    navigate('/components/new');
    toast.success(getTranslation(
      'JSON processed! Fill in the component details',
      'JSON processado! Preencha os detalhes do componente'
    ));
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
    toast.success(getTranslation(
      'Template generated! You can edit it now.',
      'Template gerado! Você pode editá-lo agora.'
    ));
  };

  // Define the handleJsonUpdate function inside the component
  const handleJsonUpdate = (updatedJson: string) => {
    form.setValue('jsonCode', updatedJson);
    toast.success(getTranslation(
      'JSON updated with Claude suggestions',
      'JSON atualizado com as sugestões do Claude'
    ));
  };

  return (
    <Card className="border shadow-sm">
      <JsonTransformerHeader />
      
      <CardContent>
        {/* File uploader at the beginning */}
        <div className="mb-6">
          <JsonFileUploader onJsonLoaded={handleJsonLoaded} />
        </div>
        
        {/* Structure toggle - now defaults to true */}
        <div className="flex items-center space-x-4 mb-4">
          <Switch
            id="apply-structure-toggle"
            checked={applyStructure}
            onCheckedChange={setApplyStructure}
          />
          <Label htmlFor="apply-structure-toggle" className="font-medium">
            {getTranslation(
              'Apply Standard Structure',
              'Aplicar Estrutura Padrão'
            )}
          </Label>
        </div>

        {applyStructure && (
          <div className="mb-4 p-3 border border-green-200 rounded-md bg-green-50">
            <p className="text-sm text-green-700">
              {getTranslation(
                'Standard structure will be applied: Section → Padding → Row → Column → Content Groups → Widgets',
                'A estrutura padrão será aplicada: Seção → Padding → Linha → Coluna → Grupos de Conteúdo → Widgets'
              )}
            </p>
          </div>
        )}
        
        <JsonActionsToolbar 
          onProcessJson={handleProcessJson}
          getJsonContent={getJsonContent}
          isValidJson={isValidJson}
          isValidating={isValidating}
          showElementorCopy={true}
        />
        
        <div className="mb-4">
          <button 
            type="button"
            onClick={handleCreateComponent} 
            disabled={!isValidJson || isValidating || isProcessing}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
              !isValidJson || isValidating || isProcessing
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {getTranslation('Create Component', 'Criar Componente')}
          </button>
        </div>
        
        <Form {...form}>
          <form>
            <JsonFormField 
              form={form} 
              onJsonChange={validateJsonContent} 
            />
          </form>
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
