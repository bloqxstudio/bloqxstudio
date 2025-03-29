
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  Textarea,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui';
import { Bot, Sparkles, Loader2, Code } from 'lucide-react';

interface AnalyzerProps {
  jsonCode: string;
  onJsonUpdate?: (updatedJson: string) => void;
}

const ClaudeJsonAnalyzer: React.FC<AnalyzerProps> = ({ 
  jsonCode, 
  onJsonUpdate 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      instructions: "Otimize este JSON para container moderno, responsivo e limpo. Remova propriedades desnecessárias e simplifique a estrutura. Retorne apenas o JSON otimizado."
    }
  });

  const analyzeJson = async (values: { instructions: string }) => {
    if (!jsonCode) {
      toast.error("Você precisa ter um código JSON para analisar");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-json', {
        body: {
          jsonCode,
          instructions: values.instructions
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success("Componente otimizado com sucesso!");
      } else {
        throw new Error(data.error || "Erro desconhecido na análise");
      }
    } catch (err: any) {
      console.error("Erro ao analisar JSON:", err);
      setError(err.message || "Ocorreu um erro ao analisar o JSON");
      toast.error("Erro ao analisar o JSON");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função auxiliar para extrair JSON de um texto
  const extractJsonFromText = (text: string): string | null => {
    const jsonRegex = /```json\n([\s\S]*?)\n```|```([\s\S]*?)```/;
    const match = text.match(jsonRegex);
    
    if (match) {
      return (match[1] || match[2]).trim();
    }
    
    return null;
  };

  const applyChanges = () => {
    if (!analysis) return;
    
    const extractedJson = extractJsonFromText(analysis);
    if (extractedJson && onJsonUpdate) {
      try {
        // Tentar validar o JSON extraído
        JSON.parse(extractedJson);
        
        onJsonUpdate(extractedJson);
        toast.success("JSON atualizado com sucesso!");
      } catch (err) {
        toast.error("O JSON sugerido não é válido. Por favor, revise a sugestão.");
      }
    } else {
      toast.warning("Não foi possível encontrar um JSON válido na análise.");
    }
  };

  const useQuickPrompt = () => {
    form.setValue("instructions", "Transforme este componente em um container moderno e responsivo. Simplifique ao máximo a estrutura mantendo a funcionalidade. Remova propriedades desnecessárias. Retorne APENAS o JSON final.");
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span>Otimização Automática de Componentes</span>
        </CardTitle>
        <CardDescription>
          Simplifique e modernize componentes do Elementor com um clique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(analyzeJson)} className="space-y-4">
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções para otimização</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Transforme em container moderno e responsivo" 
                      {...field} 
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between items-center">
                    <span>
                      Descreva como o componente deve ser otimizado
                    </span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={useQuickPrompt}
                      className="text-xs"
                    >
                      <Code className="h-3 w-3 mr-1" />
                      Usar prompt padrão
                    </Button>
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center">
              <Button 
                type="submit" 
                disabled={isAnalyzing} 
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Otimizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Otimizar Componente
                  </>
                )}
              </Button>
              
              {analysis && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={applyChanges}
                  className="gap-2"
                >
                  Aplicar Componente Otimizado
                </Button>
              )}
            </div>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Erro na otimização</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && extractJsonFromText(analysis) && (
          <div className="mt-6 border rounded-md p-4 bg-muted/20">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Componente Otimizado</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={applyChanges}
                className="text-xs"
              >
                Aplicar
              </Button>
            </div>
            <div className="bg-black/90 text-green-400 p-3 rounded text-xs font-mono overflow-auto max-h-64">
              <pre>{extractJsonFromText(analysis)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaudeJsonAnalyzer;
