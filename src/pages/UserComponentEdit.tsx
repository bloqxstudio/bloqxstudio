
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComponentById, updateComponent, getCategories } from '@/lib/api';
import { Component, UpdateComponent } from '@/lib/database.types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Input,
  Textarea,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { cleanElementorJson, validateJson } from '@/utils/jsonUtils';
import JsonCodeEditor from '@/components/forms/JsonCodeEditor';
import ImageUploadSection from '@/components/forms/ImageUploadSection';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Título deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
  code: z.string().min(10, { message: 'Código é obrigatório' }),
  visibility: z.enum(['public', 'private'], { message: 'Visibilidade deve ser pública ou privada' })
});

type FormData = z.infer<typeof formSchema>;

const UserComponentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [removeStyles, setRemoveStyles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: component, isLoading: isLoadingComponent } = useQuery({
    queryKey: ['component', id],
    queryFn: () => id ? getComponentById(id) : Promise.reject('ID não fornecido'),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching component:', error);
        toast.error('Erro ao carregar o componente');
        navigate('/components');
      }
    }
  });

  // Check if user is the owner of the component
  const isOwner = user && component ? user.id === component.created_by : false;

  useEffect(() => {
    if (component && !isOwner) {
      toast.error('Você não tem permissão para editar este componente');
      navigate('/components');
    }
  }, [component, isOwner, navigate]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      code: '',
      visibility: 'public' as const
    }
  });

  useEffect(() => {
    if (component && isOwner) {
      form.reset({
        title: component.title,
        description: component.description || '',
        code: component.code,
        visibility: component.visibility
      });
      
      // Set image preview if component has an image
      if (component.preview_image) {
        setImagePreview(component.preview_image);
      }
      
      setIsLoading(false);
    }
  }, [component, isOwner, form]);

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

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateComponent & { imageFile?: File | null }) => {
      if (!id) throw new Error('ID não fornecido');
      
      // Handle image upload if there's a new file
      let imageUrl = component?.preview_image || null;
      
      if (data.imageFile) {
        // Logic to upload the image would go here
        // For now, we'll just use the existing image URL
        // In a real implementation, you would upload the file and get a URL
      }
      
      // Remove the imageFile from the data sent to the updateComponent function
      const { imageFile, ...updateData } = data;
      
      return updateComponent(id, {
        ...updateData,
        preview_image: imageUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      queryClient.invalidateQueries({ queryKey: ['component', id] });
      toast.success('Componente atualizado com sucesso!');
      navigate(`/component/${id}`);
    },
    onError: (error) => {
      console.error('Error updating component:', error);
      toast.error('Erro ao atualizar componente. Tente novamente.');
    }
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      ...data,
      imageFile: selectedFile
    });
  };

  useEffect(() => {
    const handleError = (error: any) => {
      console.error('Error fetching component:', error);
      toast.error('Erro ao carregar o componente');
      navigate('/components');
    };

    if (component === undefined && !isLoadingComponent) {
      handleError(new Error('Component not found'));
    }
  }, [component, isLoadingComponent, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to={`/component/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o Componente
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tighter">Editar Meu Componente</h1>
          <p className="text-muted-foreground mt-1">
            Atualize os detalhes do seu componente
          </p>
        </div>
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Dados do Componente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || isLoadingComponent ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Título do componente" {...field} />
                        </FormControl>
                        <FormDescription>
                          Nome que identifica o componente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição detalhada do componente" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Explique o propósito do componente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <ImageUploadSection 
                    selectedFile={selectedFile}
                    imagePreview={imagePreview}
                    onFileChange={handleFileChange}
                  />
                  
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibilidade</FormLabel>
                        <FormControl>
                          <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                value="public"
                                checked={field.value === 'public'}
                                onChange={() => field.onChange('public')}
                                className="h-4 w-4 text-primary"
                              />
                              <span>Público</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                value="private"
                                checked={field.value === 'private'}
                                onChange={() => field.onChange('private')}
                                className="h-4 w-4 text-primary"
                              />
                              <span>Privado</span>
                            </label>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Componentes públicos podem ser vistos por todos os usuários
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <JsonCodeEditor
                    form={form}
                    removeStyles={removeStyles}
                    setRemoveStyles={setRemoveStyles}
                  />
                  
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate(`/component/${id}`)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-opacity-50 border-t-transparent rounded-full" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default UserComponentEdit;
