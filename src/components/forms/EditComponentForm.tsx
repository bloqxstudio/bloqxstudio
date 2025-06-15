import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updateComponent } from '@/core/api';
import { useAuth } from '@/features/auth';
import ComponentFormFields from './ComponentFormFields';
import JsonCodeSection from './JsonCodeSection';
import ClaudeJsonAnalyzer from './ClaudeJsonAnalyzer';
import FormSubmitButton from './FormSubmitButton';
import { formSchema, type FormValues } from './componentFormSchema';
import { Component } from '@/core/types';

interface EditComponentFormProps {
  component: Component;
}

const EditComponentForm: React.FC<EditComponentFormProps> = ({ component }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(component.preview_image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [jsonContent, setJsonContent] = useState(component.json_code || '');
  const [applyStructure, setApplyStructure] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: component.title,
      description: component.description,
      category: component.category,
      tags: component.tags || [],
      jsonCode: component.json_code || component.code,
      visibility: component.visibility,
      alignment: component.alignment || 'left',
      columns: component.columns || '1',
      elements: (component.elements || []) as ('button' | 'video' | 'image' | 'list' | 'heading')[]
    },
    mode: 'onChange',
  });

  useEffect(() => {
    // Set initial JSON content for ClaudeJsonAnalyzer
    setJsonContent(component.json_code || component.code || '');
  }, [component]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessJson = () => {
    // Implement your JSON processing logic here
    console.log('JSON processing triggered');
  };

  const handleJsonChange = (content: string) => {
    setJsonContent(content);
  };

  const handleAnalyzeSuccess = (metadata: { title?: string; tags?: string[]; alignment?: 'left' | 'center' | 'right' | 'full'; columns?: '1' | '2' | '3+'; elements?: string[] }) => {
    if (metadata.title) form.setValue('title', metadata.title);
    if (metadata.tags) form.setValue('tags', metadata.tags);
    if (metadata.alignment) form.setValue('alignment', metadata.alignment);
    if (metadata.columns) form.setValue('columns', metadata.columns);
    if (metadata.elements) form.setValue('elements', metadata.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[]);
  };

  const onSubmit = async (values: FormValues) => {
    setIsUploading(true);
    try {
      // TODO: Handle image upload if selectedFile exists
      let previewImageUrl = component.preview_image;
      
      if (selectedFile) {
        // For now, we'll keep the existing image since uploadComponentImage is not implemented
        console.log('Image upload not implemented yet, keeping existing image');
      }

      const updatePayload = {
        title: values.title,
        description: values.description,
        category: values.category,
        tags: values.tags || [],
        code: values.jsonCode,
        json_code: values.jsonCode,
        preview_image: previewImageUrl,
        visibility: values.visibility,
        alignment: values.alignment,
        columns: values.columns,
        elements: values.elements || [],
      };

      const result = await updateComponent(component.id, updatePayload);

      if (result) {
        toast.success('Componente atualizado com sucesso!');
        navigate(`/component/${component.id}`);
      } else {
        toast.error('Erro ao atualizar componente');
      }
    } catch (error: any) {
      toast.error(`Erro ao atualizar componente: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <JsonCodeSection
              form={form}
              onProcessJson={handleProcessJson}
              simplified={false}
              onContentChange={handleJsonChange}
              applyStructure={applyStructure}
              setApplyStructure={setApplyStructure}
            />

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

            <ComponentFormFields
              form={form}
              selectedFile={selectedFile}
              imagePreview={imagePreview}
              onFileChange={handleFileChange}
            />

            <FormSubmitButton isLoading={isUploading} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditComponentForm;
