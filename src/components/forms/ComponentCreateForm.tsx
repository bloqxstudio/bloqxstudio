
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, Image } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createComponent, uploadComponentImage, getCategories } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { 
  Button, 
  Card, 
  CardContent,
  Input,
  Textarea,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui';
import CodeViewer from '@/components/CodeViewer';
import { formSchema, type FormValues } from './componentFormSchema';
import { cleanElementorJson, validateJson } from '@/utils/jsonUtils';
import ComponentFormActions from './ComponentFormActions';

const ComponentCreateForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewJson, setPreviewJson] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      toast({
        title: "Componente criado!",
        description: "Seu componente foi criado e salvo com sucesso.",
      });
      navigate('/components');
    },
    onError: (error) => {
      console.error('Error creating component:', error);
      toast({
        title: "Erro ao criar componente",
        description: "Ocorreu um erro ao salvar o componente. Tente novamente.",
        variant: "destructive"
      });
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
      toast({
        title: "Nenhum código para limpar",
        description: "Por favor, insira um código JSON antes de limpar.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const cleanedJson = cleanElementorJson(currentJson);
      form.setValue('jsonCode', cleanedJson);
      setPreviewJson(cleanedJson);
      setShowPreview(true);
      
      toast({
        title: "Código limpo com sucesso!",
        description: "O JSON foi formatado e limpo para o padrão Elementor.",
      });
    } catch (e) {
      toast({
        title: "Erro ao limpar o código",
        description: "O texto fornecido não pôde ser limpo corretamente. Verifique se é um JSON válido.",
        variant: "destructive"
      });
    }
  };

  const handlePreviewJson = () => {
    const currentJson = form.getValues('jsonCode');
    
    if (!validateJson(currentJson)) {
      toast({
        title: "JSON inválido",
        description: "O texto fornecido não é um JSON válido. Não é possível visualizar.",
        variant: "destructive"
      });
      return;
    }
    
    setPreviewJson(currentJson);
    setShowPreview(true);
  };

  const onSubmit = async (values: FormValues) => {
    if (!validateJson(values.jsonCode)) {
      toast({
        title: "JSON inválido",
        description: "O texto fornecido não é um JSON válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      let previewImageUrl = null;
      
      // Upload image if selected
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name}`;
        previewImageUrl = await uploadComponentImage(selectedFile, fileName);
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para criar componentes.",
          variant: "destructive"
        });
        return;
      }
      
      const tagsList = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
      
      // Create component
      const newComponent = {
        title: values.title,
        description: values.description,
        type: "elementor",
        code: values.jsonCode,
        json_code: values.jsonCode,
        category: values.category,
        preview_image: previewImageUrl,
        tags: tagsList,
        visibility: values.visibility,
        created_by: user.id
      };
      
      createMutation.mutate(newComponent);
    } catch (error) {
      console.error('Error creating component:', error);
      toast({
        title: "Erro ao criar componente",
        description: "Ocorreu um erro ao salvar o componente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Hero de lançamento" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome descritivo do componente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        {...field}
                      >
                        <option value="" disabled>Selecione uma categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      Selecione a categoria do componente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o propósito e funcionalidade deste componente" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Explique brevemente para que serve este componente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibilidade</FormLabel>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="public"
                        checked={field.value === 'public'}
                        onChange={() => field.onChange('public')}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span>Público</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="private"
                        checked={field.value === 'private'}
                        onChange={() => field.onChange('private')}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span>Privado</span>
                    </label>
                  </div>
                  <FormDescription>
                    Componentes públicos ficam visíveis para todos os usuários
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="hero, lançamento, produto" {...field} />
                  </FormControl>
                  <FormDescription>
                    Adicione tags separadas por vírgula
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Image upload field */}
            <div className="space-y-2">
              <FormLabel>Imagem de Pré-visualização</FormLabel>
              <div className="border border-input rounded-md p-4">
                <div className="flex items-center gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Selecionar Imagem
                  </Button>
                  <Input 
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
                  </p>
                </div>
                
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Pré-visualização:</p>
                    <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              <FormDescription>
                Adicione uma imagem para representar visualmente o componente
              </FormDescription>
            </div>
            
            <FormField
              control={form.control}
              name="jsonCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código JSON do Elementor</FormLabel>
                  <ComponentFormActions 
                    onCleanJson={handleCleanJson}
                    onPreviewJson={handlePreviewJson}
                  />
                  <FormControl>
                    <Textarea 
                      placeholder='{"type": "elementor", "elements": [...]}'
                      className="min-h-[200px] font-mono text-sm"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Cole o código JSON do Elementor aqui
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {showPreview && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-lg font-medium mb-3">Pré-visualização:</h3>
                <CodeViewer code={previewJson} title="JSON Formatado" />
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="gap-2" 
                disabled={createMutation.isPending || isUploading}
              >
                {createMutation.isPending || isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Componente
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ComponentCreateForm;
