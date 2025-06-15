
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createComponent } from '@/core/api';
import { useAuth } from '@/features/auth';
import { componentFormSchema, type ComponentFormData } from '@/components/forms/componentFormSchema';

export const useComponentCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [applyStructure, setApplyStructure] = useState(false);

  const form = useForm<ComponentFormData>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'general',
      tags: [],
      jsonCode: '',
      visibility: 'public',
      alignment: undefined,
      columns: undefined,
      elements: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: createComponent,
    onSuccess: () => {
      toast.success('Componente criado com sucesso!');
      // Clear session storage after successful creation
      sessionStorage.removeItem('processedElementorJson');
      navigate('/components');
    },
    onError: (error) => {
      console.error('Error creating component:', error);
      toast.error('Erro ao criar componente');
    },
  });

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleProcessJson = async () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast.error('Cole o JSON do Elementor primeiro');
      return;
    }

    try {
      // Validate JSON
      JSON.parse(currentJson);
      
      // Store processed JSON in session storage for potential re-use
      sessionStorage.setItem('processedElementorJson', currentJson);
      
      toast.success('JSON processado com sucesso!');
    } catch (error) {
      console.error('Error processing JSON:', error);
      toast.error('JSON inválido. Verifique a sintaxe.');
    }
  };

  const loadProcessedJson = () => {
    const stored = sessionStorage.getItem('processedElementorJson');
    if (stored) {
      form.setValue('jsonCode', stored);
      setJsonContent(stored);
    }
  };

  const handleJsonChange = (content: string) => {
    setJsonContent(content);
  };

  const handleAnalyzeSuccess = (data: any) => {
    if (data.title) form.setValue('title', data.title);
    if (data.description) form.setValue('description', data.description);
    if (data.tags) form.setValue('tags', data.tags);
    if (data.category) form.setValue('category', data.category);
    if (data.alignment) form.setValue('alignment', data.alignment);
    if (data.columns) form.setValue('columns', data.columns);
    if (data.elements) form.setValue('elements', data.elements);
  };

  const onSubmit = async (data: ComponentFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um componente');
      return;
    }

    try {
      setIsUploading(true);
      
      let previewImageUrl = '';
      
      if (selectedFile) {
        // For now, we'll skip the image upload since it's not implemented
        console.log('Image upload not implemented yet');
        // previewImageUrl = await uploadComponentImage(selectedFile);
      }

      const componentData = {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags || [],
        code: data.jsonCode, // Use the JSON directly
        json_code: data.jsonCode, // Store the same JSON
        preview_image: previewImageUrl,
        type: 'elementor',
        visibility: data.visibility,
        alignment: data.alignment,
        columns: data.columns,
        elements: data.elements,
        created_by: user.id, // Add the missing created_by field
      };

      await createMutation.mutateAsync(componentData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao criar componente');
    } finally {
      setIsUploading(false);
    }
  };

  return {
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
  };
};
