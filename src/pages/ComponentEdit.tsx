
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
  Input,
  Textarea,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';

// Update validation schema to match new database structure
const formSchema = z.object({
  title: z.string().min(3, { message: 'Título deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  code: z.string().min(10, { message: 'Código é obrigatório' }),
  visibility: z.enum(['public', 'private'], { message: 'Visibilidade deve ser pública ou privada' })
});

type FormData = z.infer<typeof formSchema>;

const ComponentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not an admin
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Acesso restrito apenas para administradores');
      navigate('/components');
    }
  }, [isAdmin, navigate]);

  // Get component data
  const { data: component, isLoading: isLoadingComponent } = useQuery({
    queryKey: ['component', id],
    queryFn: () => id ? getComponentById(id) : Promise.reject('ID não fornecido'),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching component:', error);
        toast.error('Erro ao carregar o componente');
        navigate('/admin');
      }
    }
  });

  // Get categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Setup form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      code: '',
      visibility: 'public' as const
    }
  });

  // Update form values when component data is loaded
  useEffect(() => {
    if (component) {
      form.reset({
        title: component.title,
        description: component.description || '',
        category: component.category,
        code: component.code,
        visibility: component.visibility
      });
      setIsLoading(false);
    }
  }, [component, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateComponent) => {
      if (!id) throw new Error('ID não fornecido');
      return updateComponent(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      queryClient.invalidateQueries({ queryKey: ['component', id] });
      toast.success('Componente atualizado com sucesso!');
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Error updating component:', error);
      toast.error('Erro ao atualizar componente. Tente novamente.');
    }
  });

  // Handle form submission
  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  // Add error handling for useQuery
  useEffect(() => {
    const handleError = (error: any) => {
      console.error('Error fetching component:', error);
      toast.error('Erro ao carregar o componente');
      navigate('/admin');
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
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o Painel
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tighter">Editar Componente</h1>
          <p className="text-muted-foreground mt-1">
            Atualize os detalhes do componente
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
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Código do componente" 
                            {...field} 
                            rows={12}
                            className="font-mono text-xs"
                          />
                        </FormControl>
                        <FormDescription>
                          Cole o código do componente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
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

export default ComponentEdit;
