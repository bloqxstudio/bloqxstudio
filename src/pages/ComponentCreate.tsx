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
import { Save, FileJson, X, Wand2 } from 'lucide-react';
import CodeViewer from '@/components/CodeViewer';
import { getSampleComponents, components as globalComponents } from '@/lib/data';

// Form validation schema using Zod
const formSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  tags: z.string().optional(),
  jsonCode: z.string().min(10, { message: "O código JSON é obrigatório" })
});

type FormValues = z.infer<typeof formSchema>;

// Function to clean Elementor JSON
const cleanElementorJson = (dirtyJson: string): string => {
  try {
    // Parse the JSON first to make sure it's valid
    const parsed = JSON.parse(dirtyJson);
    
    // Extract only what's needed for Elementor components
    // This is a simplified version - you may need to adjust based on your exact requirements
    const cleaned = {
      elements: parsed.elements || [],
      settings: parsed.settings || {},
    };
    
    // Return the cleaned JSON formatted with 2 spaces
    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    // If parsing fails, return the original string
    console.error("Error cleaning JSON:", e);
    return dirtyJson;
  }
};

const ComponentCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [previewJson, setPreviewJson] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
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

  // Handle clean and format button
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

  // Preview JSON
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
    
    // Create a new component object
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
    
    // Add the new component to our components array
    // In a real app, this would be an API call
    globalComponents.push(newComponent);
    
    // Show success message
    toast({
      title: "Componente criado!",
      description: "Seu componente foi criado e salvo com sucesso.",
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
                      <div className="flex items-center gap-2 mb-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleCleanJson}
                          className="gap-1"
                        >
                          <Wand2 className="h-4 w-4" />
                          Limpar e Formatar
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handlePreviewJson}
                          className="gap-1"
                        >
                          <FileJson className="h-4 w-4" />
                          Visualizar
                        </Button>
                      </div>
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
