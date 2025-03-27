
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
import WireframeExample from '@/components/WireframeExample';
import FilterSection from './filters/FilterSection';

const ComponentCreateForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewJson, setPreviewJson] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [removeStyles, setRemoveStyles] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [showWireframeExample, setShowWireframeExample] = useState(false);

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
      visibility: 'public',
      alignment: undefined,
      columns: undefined,
      elements: []
    }
  });

  // Mutation for creating component
  const createMutation = useMutation({
    mutationFn: createComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Componente criado com sucesso!');
      navigate('/components');
    },
    onError: (error: any) => {
      console.error('Error creating component:', error);
      toast.error('Erro ao criar componente: ' + (error?.message || 'Erro desconhecido'));
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
      toast.warning('Nenhum código para limpar');
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
      
      // Clean and format the JSON with the wireframe modes
      const cleanedJson = cleanElementorJson(currentJson, removeStyles, wireframeMode);
      form.setValue('jsonCode', cleanedJson);
      setPreviewJson(cleanedJson);
      setShowPreview(true);
      
      let successMessage = 'JSON limpo e formatado com sucesso!';
      
      if (removeStyles && wireframeMode) {
        successMessage = 'JSON transformado para wireframe completo com placeholders em português e nomenclatura Client-First!';
        // Show wireframe example if both modes are active
        setShowWireframeExample(true);
      } else if (removeStyles) {
        successMessage = 'JSON limpo e formatado com estilo wireframe premium e nomenclatura Client-First!';
      } else if (wireframeMode) {
        successMessage = 'JSON transformado para wireframe com placeholders em português!';
      }
      
      toast.success(successMessage, {
        id: 'clean-success',
      });
    } catch (e) {
      console.error('Error cleaning JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique o formato e tente novamente.', {
        id: 'clean-error',
      });
    }
  };

  const handlePreviewJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast.warning('Nenhum código para visualizar');
      return;
    }
    
    try {
      // Check if it's valid JSON
      if (!validateJson(currentJson)) {
        toast.error('O código não é um JSON válido. Verifique a sintaxe.', {
          duration: 3000,
        });
        return;
      }
      
      // Format and display
      const formattedJson = JSON.stringify(JSON.parse(currentJson), null, 2);
      setPreviewJson(formattedJson);
      setShowPreview(true);
    } catch (e) {
      console.error('Error previewing JSON:', e);
      toast.error('Erro ao formatar o JSON. Verifique a sintaxe.', {
        duration: 3000,
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Validate if the JSON field has content
      if (!values.jsonCode) {
        toast.error('Por favor, insira o código JSON do componente.');
        return;
      }

      // Start the upload process
      let imageUrl = null;
      
      if (selectedFile) {
        setIsUploading(true);
        try {
          // Generate a unique path for the image
          const timestamp = new Date().getTime();
          const path = `${timestamp}-${selectedFile.name}`;
          imageUrl = await uploadComponentImage(selectedFile, path);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Erro ao fazer upload da imagem. O componente será criado sem imagem.');
        } finally {
          setIsUploading(false);
        }
      }
      
      // Create the component with the correct field names
      const componentData = {
        title: values.title,
        description: values.description || '',
        category: values.category || '',
        code: values.jsonCode, // This is actually 'code' in the database
        json_code: values.jsonCode, // Also store in 'json_code'
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        visibility: values.visibility,
        preview_image: imageUrl, // Use preview_image instead of image
        type: 'elementor',
        created_by: (await supabase.auth.getUser()).data.user?.id || '',
        // Add the new fields
        alignment: values.alignment,
        columns: values.columns,
        elements: values.elements
      };
      
      createMutation.mutate(componentData);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Erro ao processar o formulário: ' + (error as Error).message);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoSection form={form} categories={categories} />
            
            {/* We'll make description optional */}
            <DescriptionSection form={form} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VisibilitySection form={form} />
              <TagsSection form={form} />
            </div>
            
            <ImageUploadSection 
              selectedFile={selectedFile}
              imagePreview={imagePreview}
              onFileChange={handleFileChange} 
            />
            
            {/* Add the new filter section */}
            <FilterSection form={form} />
            
            <JsonCodeSection 
              form={form} 
              showPreview={showPreview} 
              previewJson={previewJson} 
              onCleanJson={handleCleanJson} 
              onPreviewJson={handlePreviewJson}
              removeStyles={removeStyles}
              setRemoveStyles={setRemoveStyles}
              wireframeMode={wireframeMode}
              setWireframeMode={setWireframeMode}
            />
            
            {showWireframeExample && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-lg font-medium mb-3">Exemplo de Wireframe:</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Veja abaixo um exemplo do estilo wireframe que será aplicado ao seu componente:
                </p>
                <WireframeExample />
              </div>
            )}
            
            <FormSubmitButton isLoading={createMutation.isPending || isUploading} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ComponentCreateForm;
