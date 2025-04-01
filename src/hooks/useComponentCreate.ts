import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComponent, uploadComponentImage } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { validateJson, cleanElementorJson } from '@/utils/jsonUtils';
import { formSchema, type FormValues } from '@/components/forms/componentFormSchema';

export const useComponentCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingJson, setIsProcessingJson] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [applyStructure, setApplyStructure] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      tags: '',
      jsonCode: '',
      visibility: 'public',
      alignment: undefined,
      columns: undefined,
      elements: []
    }
  });

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
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast.warning('Nenhum código para processar');
      return;
    }
    
    setIsProcessingJson(true);
    
    try {
      if (!validateJson(currentJson)) {
        toast.error('O código não é um JSON válido. Verifique a sintaxe.');
        return;
      }
      
      const cleanedJson = cleanElementorJson(currentJson, false, true, applyStructure);
      form.setValue('jsonCode', cleanedJson);
      setJsonContent(cleanedJson);

      if (applyStructure) {
        toast.success('JSON estruturado e transformado!');
      } else {
        toast.success('JSON validado e transformado!');
      }
      
    } catch (e) {
      console.error('Erro ao processar JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique o formato.');
    } finally {
      setIsProcessingJson(false);
    }
  };

  const handleJsonChange = (content: string) => {
    setJsonContent(content);
  };

  const handleAnalyzeSuccess = (metadata: {
    title?: string;
    tags?: string;
    alignment?: 'left' | 'center' | 'right' | 'full';
    columns?: '1' | '2' | '3+';
    elements?: string[];
  }) => {
    console.log('Received metadata from AI:', metadata);
    
    if (metadata.title) {
      form.setValue('title', metadata.title);
    }
    
    if (metadata.tags) {
      form.setValue('tags', metadata.tags);
    }
    
    if (metadata.alignment) {
      form.setValue('alignment', metadata.alignment);
    }
    
    if (metadata.columns) {
      form.setValue('columns', metadata.columns);
    }
    
    if (metadata.elements && Array.isArray(metadata.elements)) {
      const validElementTypes: ("image" | "heading" | "button" | "list" | "video")[] = 
        metadata.elements
          .filter((el): el is "image" | "heading" | "button" | "list" | "video" => 
            ["image", "heading", "button", "list", "video"].includes(el));
      
      form.setValue('elements', validElementTypes);
    }
    
    toast.success('Dados do componente extraídos com sucesso!');
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!values.jsonCode) {
        toast.error('Por favor, insira o código JSON do componente.');
        return;
      }

      let imageUrl = null;
      
      if (selectedFile) {
        setIsUploading(true);
        try {
          const timestamp = new Date().getTime();
          const path = `${timestamp}-${selectedFile.name}`;
          imageUrl = await uploadComponentImage(selectedFile, path);
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          toast.error('Erro ao fazer upload da imagem. O componente será criado sem imagem.');
        } finally {
          setIsUploading(false);
        }
      }
      
      const componentData = {
        title: values.title,
        description: '',
        category: '',
        code: values.jsonCode,
        json_code: values.jsonCode,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        visibility: values.visibility,
        preview_image: imageUrl,
        type: 'elementor',
        created_by: (await supabase.auth.getUser()).data.user?.id || '',
        alignment: values.alignment,
        columns: values.columns,
        elements: values.elements
      };
      
      createMutation.mutate(componentData);
    } catch (error) {
      console.error('Erro no envio do formulário:', error);
      toast.error('Erro ao processar o formulário: ' + (error as Error).message);
    }
  };

  const loadProcessedJson = () => {
    const processedJson = sessionStorage.getItem('processedJson');
    if (processedJson) {
      form.setValue('jsonCode', processedJson);
      setJsonContent(processedJson);
      sessionStorage.removeItem('processedJson');
      toast.info('JSON carregado da transformação anterior');
    }
  };

  return {
    form,
    selectedFile,
    imagePreview,
    isUploading,
    isProcessingJson,
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
