
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';
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
import { globalComponents } from '@/lib/data';
import { formSchema, type FormValues } from './componentFormSchema';
import { cleanElementorJson, validateJson } from '@/utils/jsonUtils';
import ComponentFormActions from './ComponentFormActions';

const ComponentCreateForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [previewJson, setPreviewJson] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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

  const onSubmit = (values: FormValues) => {
    if (!validateJson(values.jsonCode)) {
      toast({
        title: "JSON inválido",
        description: "O texto fornecido não é um JSON válido.",
        variant: "destructive"
      });
      return;
    }

    const tagsList = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
    
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
    
    globalComponents.push(newComponent);
    
    toast({
      title: "Componente criado!",
      description: "Seu componente foi criado e salvo com sucesso.",
    });
    
    navigate('/components');
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
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Componente
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ComponentCreateForm;
