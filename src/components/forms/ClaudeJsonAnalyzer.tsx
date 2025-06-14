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
import { Bot, Sparkles, Loader2, Code, Wand2 } from 'lucide-react';

interface AnalyzerProps {
  jsonCode: string;
  onJsonUpdate?: (updatedJson: string) => void;
  onAnalysisSuccess?: (metadata: {
    title?: string;
    tags?: string[];
    alignment?: 'left' | 'center' | 'right' | 'full';
    columns?: '1' | '2' | '3+';
    elements?: string[];
  }) => void;
}

const ClaudeJsonAnalyzer: React.FC<AnalyzerProps> = ({ 
  jsonCode, 
  onJsonUpdate,
  onAnalysisSuccess 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      instructions: "Transform this Elementor component into a modern responsive container. Keep all spacing, padding, and flex directions. Improve responsiveness and remove unnecessary properties while maintaining the original structure and functionality."
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

  const extractMetadata = async () => {
    if (!jsonCode) {
      toast.error("Você precisa ter um código JSON para extrair metadados");
      return;
    }

    setIsExtracting(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-json', {
        body: {
          jsonCode,
          instructions: "Analyze this component and extract metadata in JSON format. Include: 1) suggested title, 2) keywords for tags (comma separated), 3) layout alignment (left, center, right, or full), 4) number of columns (1, 2, or 3+), 5) element types present (image, heading, button, list, video). ONLY return a valid JSON object with these fields, nothing else."
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        // Extract JSON from the Claude response
        const jsonMatch = data.analysis.match(/```json\n([\s\S]*?)\n```|```([\s\S]*?)```/);
        if (jsonMatch) {
          const metadataStr = (jsonMatch[1] || jsonMatch[2]).trim();
          try {
            const metadata = JSON.parse(metadataStr);
            console.log("Extracted metadata:", metadata);
            
            if (onAnalysisSuccess) {
              // Convert tags from comma-separated string to array if needed
              let tagsArray: string[] = [];
              if (metadata.tags) {
                if (typeof metadata.tags === 'string') {
                  tagsArray = metadata.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
                } else if (Array.isArray(metadata.tags)) {
                  tagsArray = metadata.tags;
                }
              }
              
              onAnalysisSuccess({
                title: metadata.title || '',
                tags: tagsArray,
                alignment: metadata.alignment || undefined,
                columns: metadata.columns || undefined,
                elements: metadata.elements || []
              });
            }
            toast.success("Metadados extraídos com sucesso!");
          } catch (e) {
            console.error("Error parsing metadata JSON:", e);
            toast.error("Erro ao processar os metadados extraídos");
          }
        } else {
          toast.warning("Não foi possível extrair metadados estruturados");
        }
      } else {
        throw new Error(data.error || "Erro desconhecido na extração");
      }
    } catch (err: any) {
      console.error("Erro ao extrair metadados:", err);
      toast.error("Erro ao extrair metadados do componente");
    } finally {
      setIsExtracting(false);
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
    form.setValue("instructions", "Optimize this Elementor component by converting all sections and columns to modern flex containers. Preserve all spacing, padding, margins, and flex directions. Remove unnecessary styling properties but keep the exact structure and layout. Return ONLY the optimized JSON without explanations.");
  };

  const useExpertPrompt = () => {
    form.setValue("instructions", "You are a senior front-end developer specializing in Elementor. Transform this JSON into a highly optimized and responsive container component. CRITICAL REQUIREMENTS: 1) Preserve ALL flex directions, container structures, spacing values and padding; 2) Convert all sections/columns to modern containers with proper flex settings; 3) Remove only unnecessary styling properties while keeping layout intact; 4) Ensure the component remains visually identical; 5) Return ONLY the optimized JSON code with no explanations.");
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span>Otimização e Análise com IA</span>
        </CardTitle>
        <CardDescription>
          Extraia informações e otimize componentes automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Extract Metadata Button */}
        <Button 
          onClick={extractMetadata}
          disabled={isExtracting}
          className="w-full mb-4 gap-2"
          variant="outline"
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extraindo metadados...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Preencher Formulário Automaticamente
            </>
          )}
        </Button>

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
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription className="flex flex-wrap justify-between items-center gap-2">
                    <span>
                      Descreva como o componente deve ser otimizado
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={useQuickPrompt}
                        className="text-xs"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Prompt básico
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={useExpertPrompt}
                        className="text-xs"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Prompt avançado
                      </Button>
                    </div>
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
