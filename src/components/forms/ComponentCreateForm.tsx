
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui';
import { useComponentCreate } from '@/hooks/useComponentCreate';
import JsonCodeSection from './JsonCodeSection';
import ClaudeJsonAnalyzer from './ClaudeJsonAnalyzer';
import ComponentFormFields from './ComponentFormFields';
import FormSubmitButton from './FormSubmitButton';
import { Form } from '@/components/ui';

const ComponentCreateForm = () => {
  const {
    form,
    selectedFile,
    imagePreview,
    isUploading,
    createMutation,
    handleFileChange,
    handleProcessJson,
    onSubmit,
    loadProcessedJson,
    handleJsonChange,
    handleAnalyzeSuccess,
    jsonContent
  } = useComponentCreate();

  // Check for processed JSON in sessionStorage on component mount
  useEffect(() => {
    loadProcessedJson();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        {/* JSON Input Section - Always First */}
        <JsonCodeSection
          form={form}
          onProcessJson={handleProcessJson}
          simplified={false}
          onContentChange={handleJsonChange}
        />

        {/* Claude AI Analyzer for Auto-extraction */}
        {jsonContent && (
          <ClaudeJsonAnalyzer
            jsonCode={jsonContent}
            onJsonUpdate={(updatedJson) => {
              form.setValue('jsonCode', updatedJson);
              handleJsonChange(updatedJson);
            }}
            onAnalysisSuccess={handleAnalyzeSuccess}
          />
        )}

        {/* Form Fields Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <ComponentFormFields 
              form={form} 
              selectedFile={selectedFile}
              imagePreview={imagePreview}
              onFileChange={handleFileChange}
            />
            
            <FormSubmitButton isLoading={isUploading || createMutation.isPending} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ComponentCreateForm;
