
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Save, FileJson, X } from 'lucide-react';

// Form validation schema using Zod
const formSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  tags: z.string().optional(),
  jsonCode: z.string().min(10, { message: "O código JSON é obrigatório" })
});

type FormValues = z.infer<typeof formSchema>;

const ComponentCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Create form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'componentes',
      tags: '',
      jsonCode: ''
    }
  });

  // JSON validation
  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    // Check if the JSON is valid
    if (!validateJson(values.jsonCode)) {
      toast({
        title: "JSON inválido",
        description: "O texto fornecido não é um JSON válido.",
        variant: "destructive"
      });
      return;
    }

    // For now, log the component to console and simulate a successful creation
    console.log("Novo componente:", values);
    
    // Split tags by commas
    const tagsList = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
    
    // In a real implementation, this would save to a database
    const newComponent = {
      id: `comp-${Date.now()}`,
      title: values.title,
      description: values.description,
      type: "elementor",
      dateCreated: new Date().toISOString().split('T')[0],
      dateUpdated: new Date().toISOString().split('T')[0],
      tags: tagsList,
      category: values.category,
      jsonCode: values.jsonCode
    };
    
    // Show success message
    toast({
      title: "Componente criado!",
      description: "Seu componente foi criado com sucesso.",
    });
    
    // Navigate back to components page
    navigate('/components');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Criar novo componente</h1>
            <p className="text-muted-foreground mt-1">
              Adicione um novo componente Elementor à biblioteca
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/components')}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        </div>
        
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
                            <option value="componentes">Componentes</option>
                            <option value="bloqx-kit">Bloqx Kit</option>
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
                
                <FormField
                  control={form.control}
                  name="jsonCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código JSON do Elementor</FormLabel>
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
                
                <div className="flex justify-end">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Componente
                  </Button>
                </div>
              </form>
            </Form>
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

export default ComponentCreate;
