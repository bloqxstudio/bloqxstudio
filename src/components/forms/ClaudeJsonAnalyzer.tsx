
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
import { Bot, Sparkles, Loader2 } from 'lucide-react';

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
      instructions: "Analise este JSON do Elementor e sugira melhorias para torná-lo mais eficiente e limpo. Se possível, converta elementos para containers modernos e otimize a estrutura."
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
        toast.success("Análise concluída com sucesso!");
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span>Análise Inteligente com Claude</span>
        </CardTitle>
        <CardDescription>
          Use IA para analisar e melhorar seu componente do Elementor
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
                  <FormLabel>Instruções para o Claude</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Otimize este componente para mobile, simplifique a estrutura..." 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva o que você gostaria que o Claude analisasse ou melhorasse no seu componente
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
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analisar com IA
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
                  Aplicar Sugestões
                </Button>
              )}
            </div>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Erro na análise</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="mt-6 border rounded-md p-4 bg-muted/20">
            <h3 className="text-lg font-medium mb-2">Análise do Claude</h3>
            <div className="prose prose-sm max-w-none">
              {analysis.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaudeJsonAnalyzer;
