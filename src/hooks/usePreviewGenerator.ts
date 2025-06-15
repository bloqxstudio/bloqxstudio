
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Component } from '@/core/types';

interface PreviewGenerationResult {
  previewUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  method?: 'screenshot' | 'svg' | 'fallback' | 'error';
  isValidJson?: boolean;
}

export const usePreviewGenerator = () => {
  const [generationState, setGenerationState] = useState<Record<string, PreviewGenerationResult>>({});

  const generatePreview = useCallback(async (component: Component): Promise<string | null> => {
    const componentId = component.id;
    
    // Se já está gerando, não gerar novamente
    if (generationState[componentId]?.isGenerating) {
      console.log(`⏳ Preview já está sendo gerado para ${componentId}`);
      return null;
    }

    // Se já tem preview, não regenerar
    if (generationState[componentId]?.previewUrl) {
      console.log(`✅ Preview já existe para ${componentId}`);
      return generationState[componentId].previewUrl;
    }

    console.log(`🎨 Iniciando geração de preview para: ${component.title} (${componentId})`);

    setGenerationState(prev => ({
      ...prev,
      [componentId]: { previewUrl: null, isGenerating: true, error: null }
    }));

    try {
      // Chamar edge function para gerar preview
      console.log('📡 Chamando edge function generate-preview...');
      
      const { data, error } = await supabase.functions.invoke('generate-preview', {
        body: {
          componentId: component.id,
          title: component.title,
          jsonCode: component.json_code || component.code,
          category: component.category,
          tags: component.tags || []
        }
      });

      if (error) {
        console.error('❌ Erro da edge function:', error);
        throw new Error(error.message || 'Erro ao gerar preview');
      }

      console.log('📊 Resposta da edge function:', {
        hasPreviewUrl: !!data?.previewUrl,
        method: data?.method,
        isValidJson: data?.isValidJson,
        cached: data?.cached
      });

      const previewUrl = data?.previewUrl;
      const method = data?.method || 'fallback';
      const isValidJson = data?.isValidJson !== false;

      setGenerationState(prev => ({
        ...prev,
        [componentId]: { 
          previewUrl, 
          isGenerating: false, 
          error: null,
          method,
          isValidJson
        }
      }));

      if (previewUrl) {
        console.log(`✅ Preview gerado com sucesso para ${componentId} usando método: ${method}`);
      } else {
        console.warn(`⚠️ Nenhum preview foi gerado para ${componentId}`);
      }

      return previewUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ Erro ao gerar preview para ${componentId}:`, errorMessage);
      
      setGenerationState(prev => ({
        ...prev,
        [componentId]: { 
          previewUrl: null, 
          isGenerating: false, 
          error: errorMessage,
          method: 'error'
        }
      }));

      return null;
    }
  }, [generationState]);

  const getPreviewState = useCallback((componentId: string): PreviewGenerationResult => {
    return generationState[componentId] || { 
      previewUrl: null, 
      isGenerating: false, 
      error: null 
    };
  }, [generationState]);

  const clearPreviewCache = useCallback((componentId?: string) => {
    if (componentId) {
      setGenerationState(prev => {
        const newState = { ...prev };
        delete newState[componentId];
        return newState;
      });
      console.log(`🗑️ Cache limpo para componente ${componentId}`);
    } else {
      setGenerationState({});
      console.log('🗑️ Cache de previews limpo completamente');
    }
  }, []);

  const regeneratePreview = useCallback(async (component: Component): Promise<string | null> => {
    console.log(`🔄 Regenerando preview para: ${component.title}`);
    clearPreviewCache(component.id);
    return generatePreview(component);
  }, [generatePreview, clearPreviewCache]);

  return {
    generatePreview,
    getPreviewState,
    clearPreviewCache,
    regeneratePreview
  };
};
