
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

  const handleProcessJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!currentJson) {
      toast.warning('Nenhum código para processar');
      return;
    }
    
    setIsProcessingJson(true);
    
    try {
      // Validar e transformar o JSON
      if (!validateJson(currentJson)) {
        toast.error('O código não é um JSON válido. Verifique a sintaxe.');
        return;
      }
      
      // Transformar em container
      const cleanedJson = cleanElementorJson(currentJson, false, true);
      form.setValue('jsonCode', cleanedJson);
      toast.success('JSON validado e transformado em container!');
      
    } catch (e) {
      console.error('Erro ao processar JSON:', e);
      toast.error('Erro ao processar o JSON. Verifique o formato.');
    } finally {
      setIsProcessingJson(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Validar se o campo JSON tem conteúdo
      if (!values.jsonCode) {
        toast.error('Por favor, insira o código JSON do componente.');
        return;
      }

      // Iniciar processo de upload
      let imageUrl = null;
      
      if (selectedFile) {
        setIsUploading(true);
        try {
          // Gerar um caminho único para a imagem
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
      
      // Criar o componente com os campos simplificados
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

  // Check for processed JSON in sessionStorage
  const loadProcessedJson = () => {
    const processedJson = sessionStorage.getItem('processedJson');
    if (processedJson) {
      form.setValue('jsonCode', processedJson);
      // Limpar depois de carregar
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
    loadProcessedJson
  };
};
