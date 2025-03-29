
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui';
import { useComponentCreate } from '@/hooks/useComponentCreate';
import ComponentCreateFormContent from './ComponentCreateFormContent';

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
    loadProcessedJson
  } = useComponentCreate();

  // Check for processed JSON in sessionStorage on component mount
  useEffect(() => {
    loadProcessedJson();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <ComponentCreateFormContent
          form={form}
          selectedFile={selectedFile}
          imagePreview={imagePreview}
          onFileChange={handleFileChange}
          onProcessJson={handleProcessJson}
          onSubmit={onSubmit}
          isUploading={isUploading}
          isPending={createMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};

export default ComponentCreateForm;
