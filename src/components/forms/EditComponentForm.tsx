
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateComponent } from '@/lib/api';
import { UpdateComponent } from '@/lib/database.types';
import { toast } from 'sonner';
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
import { Save } from 'lucide-react';
import JsonCodeEditor from './JsonCodeEditor';
import CategorySelect from './CategorySelect';
import VisibilityOptions from './VisibilityOptions';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Título deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
  category: z.string().optional(),
  code: z.string().min(10, { message: 'Código é obrigatório' }),
  visibility: z.enum(['public', 'private'], { message: 'Visibilidade deve ser pública ou privada' })
});

type FormData = z.infer<typeof formSchema>;

interface EditComponentFormProps {
  id: string;
  component: any;
  categories: any[];
  isLoading: boolean;
}

const EditComponentForm = ({ id, component, categories, isLoading }: EditComponentFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [removeStyles, setRemoveStyles] = useState(false);

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

  useEffect(() => {
    if (component) {
      form.reset({
        title: component.title,
        description: component.description || '',
        category: component.category,
        code: component.code,
        visibility: component.visibility
      });
    }
  }, [component, form]);

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

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
        
        <CategorySelect form={form} categories={categories} />
        
        <VisibilityOptions form={form} />
        
        <JsonCodeEditor 
          form={form} 
          removeStyles={removeStyles}
          setRemoveStyles={setRemoveStyles}
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
  );
};

export default EditComponentForm;
