
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/ui';
import { useComponentCreate } from '@/features/components';
import JsonCodeSection from './JsonCodeSection';
import ClaudeJsonAnalyzer from './ClaudeJsonAnalyzer';
import ComponentFormFields from './ComponentFormFields';
import FormSubmitButton from './FormSubmitButton';
import { Form } from '@/ui';

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
    jsonContent,
    applyStructure,
    setApplyStructure
  } = useComponentCreate();

  // Check for processed JSON in sessionStorage on component mount
  useEffect(() => {
    loadProcessedJson();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Form wrapper around everything */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* JSON Input Section - Always First */}
            <JsonCodeSection
              form={form}
              onProcessJson={handleProcessJson}
              simplified={false}
              onContentChange={handleJsonChange}
              applyStructure={applyStructure}
              setApplyStructure={setApplyStructure}
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
