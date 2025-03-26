import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createComponent, uploadComponentImage, getCategories } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent,
  Form,
} from '@/components/ui';
import { cleanElementorJson, validateJson, validateElementorJson } from '@/utils/jsonUtils';
import { formSchema, type FormValues } from './componentFormSchema';

// Import the smaller components
import BasicInfoSection from './BasicInfoSection';
import DescriptionSection from './DescriptionSection';
import VisibilitySection from './VisibilitySection';
import TagsSection from './TagsSection';
import ImageUploadSection from './ImageUploadSection';
import JsonCodeSection from './JsonCodeSection';
import FormSubmitButton from './FormSubmitButton';

const ComponentCreateForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewJson, setPreviewJson] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [removeStyles, setRemoveStyles] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: '',
      jsonCode: '',
      visibility: 'public'
    }
  });

  // Mutation for creating component
  const createMutation = useMutation({
    mutationFn: createComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast('Componente criado com sucesso!');
      navigate('/components');
    },
    onError: (error: any) => {
      console.error('Error creating component:', error);
      toast('Erro ao criar componente: ' + (error?.message || 'Erro desconhecido'));
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCleanJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast('Nenhum código para limpar');
      return;
    }
    
    try {
      // First validate the JSON structure
      if (!validateJson(currentJson)) {
        toast.error('O código não é um JSON válido. Verifique a sintaxe.', {
          duration: 3000,
          id: 'invalid-json',
        });
        return;
      }
      
      // Parse and check if it's an Elementor component
      const parsed = JSON.parse(currentJson);
      if (!validateElementorJson(parsed)) {
        toast.warning('O JSON não parece ser um componente Elementor válido. A estrutura deve ter "type": "elementor" e um array "elements".', {
          duration: 5000,
          id: 'invalid-elementor',
        });
      }
      
      // Clean and format the JSON with the removeStyles flag
      const cleanedJson = cleanElementorJson(currentJson, removeStyles);
      form.setValue('jsonCode', cleanedJson);
      setPreviewJson(cleanedJson);
      setShowPreview(true);
      
      const successMessage = removeStyles 
        ? 'JSON limpo e formatado com estilo wireframe premium e nomenclatura Client-First!'
        : 'JSON limpo e formatado com sucesso!';
      
      toast.success(successMessage, {
        id: 'clean-success',
      });
    } catch (e) {
      console.error('Error cleaning JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique se é um código válido.', {
        duration: 3000,
      });
    }
  };

  const handlePreviewJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!validateJson(currentJson)) {
      toast.error('JSON inválido. O texto fornecido não é um JSON válido.', {
        duration: 3000,
      });
      return;
    }
    
    setPreviewJson(currentJson);
    setShowPreview(true);
    
    // Check if it's an Elementor component
    try {
      const parsed = JSON.parse(currentJson);
      if (!validateElementorJson(parsed)) {
        toast.warning('O JSON não parece ser um componente Elementor válido.', {
          duration: 3000,
        });
      }
    } catch (e) {
      // This shouldn't happen since we already validated the JSON
      console.error('Error parsing JSON:', e);
    }
  };

  const onSubmit = async (values: FormValues) => {
    console.log('Form submitted with values:', values);
    
    if (!validateJson(values.jsonCode)) {
      toast.error('JSON inválido. O texto fornecido não é um JSON válido.');
      return;
    }

    try {
      setIsUploading(true);
      let previewImageUrl = null;
      
      // Upload image if selected
      if (selectedFile) {
        try {
          const fileName = `${Date.now()}-${selectedFile.name}`;
          previewImageUrl = await uploadComponentImage(selectedFile, fileName);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast('Erro ao fazer upload da imagem, mas o componente será salvo sem imagem.');
        }
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast('Você precisa estar logado para criar componentes.');
        navigate('/login');
        return;
      }
      
      const tagsList = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
      
      // Create component
      const newComponent = {
        title: values.title,
        description: values.description || '',
        type: "elementor",
        code: values.jsonCode,
        json_code: values.jsonCode,
        category: values.category || 'uncategorized',
        preview_image: previewImageUrl,
        tags: tagsList,
        visibility: values.visibility,
        created_by: user.id
      };
      
      console.log('Creating component with:', newComponent);
      createMutation.mutate(newComponent);
    } catch (error) {
      console.error('Error in submit handler:', error);
      toast('Erro ao criar componente. Verifique o console para mais detalhes.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoSection form={form} categories={categories} />
            <DescriptionSection form={form} />
            <VisibilitySection form={form} />
            <TagsSection form={form} />
            
            <ImageUploadSection 
              selectedFile={selectedFile}
              imagePreview={imagePreview}
              onFileChange={handleFileChange}
            />
            
            <JsonCodeSection 
              form={form}
              showPreview={showPreview}
              previewJson={previewJson}
              onCleanJson={handleCleanJson}
              onPreviewJson={handlePreviewJson}
              removeStyles={removeStyles}
              setRemoveStyles={setRemoveStyles}
            />
            
            <FormSubmitButton isLoading={createMutation.isPending || isUploading} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ComponentCreateForm;
