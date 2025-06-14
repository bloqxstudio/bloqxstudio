import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updateComponent } from '@/core/api';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(component.preview_image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [jsonContent, setJsonContent] = useState(component.json_code || '');
  const [applyStructure, setApplyStructure] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: component.title,
      tags: component.tags?.join(', ') || '',
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

  const handleAnalyzeSuccess = (metadata: { title?: string; tags?: string; alignment?: 'left' | 'center' | 'right' | 'full'; columns?: '1' | '2' | '3+'; elements?: string[] }) => {
    if (metadata.title) form.setValue('title', metadata.title);
    if (metadata.tags) form.setValue('tags', metadata.tags);
    if (metadata.alignment) form.setValue('alignment', metadata.alignment);
    if (metadata.columns) form.setValue('columns', metadata.columns);
    if (metadata.elements) form.setValue('elements', metadata.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[]);
  };

  const onSubmit = async (values: FormValues) => {
    setIsUploading(true);
    try {
      const payload = {
        ...values,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
      };

      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('tags', JSON.stringify(payload.tags));
      formData.append('jsonCode', payload.jsonCode);
      formData.append('visibility', payload.visibility);
      formData.append('alignment', payload.alignment || '');
      formData.append('columns', payload.columns || '');
      formData.append('elements', JSON.stringify(payload.elements || []));
      formData.append('id', component.id);

      if (selectedFile) {
        formData.append('preview_image', selectedFile);
      }

      const result = await updateComponent(component.id, formData);

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
