
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Component } from '@/core/types';

interface PreviewGenerationResult {
  previewUrl: string | null;
  isGenerating: boolean;
  error: string | null;
}

export const usePreviewGenerator = () => {
  const [generationState, setGenerationState] = useState<Record<string, PreviewGenerationResult>>({});

  const generatePreview = useCallback(async (component: Component): Promise<string | null> => {
    const componentId = component.id;
    
    // Se já está gerando, não gerar novamente
    if (generationState[componentId]?.isGenerating) {
      return null;
    }

    setGenerationState(prev => ({
      ...prev,
      [componentId]: { previewUrl: null, isGenerating: true, error: null }
    }));

    try {
      // Chamar edge function para gerar preview
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
        throw new Error(error.message);
      }

      const previewUrl = data?.previewUrl;

      setGenerationState(prev => ({
        ...prev,
        [componentId]: { previewUrl, isGenerating: false, error: null }
      }));

      return previewUrl;
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      
      setGenerationState(prev => ({
        ...prev,
        [componentId]: { 
          previewUrl: null, 
          isGenerating: false, 
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      }));

      return null;
    }
  }, [generationState]);

  const getPreviewState = useCallback((componentId: string) => {
    return generationState[componentId] || { previewUrl: null, isGenerating: false, error: null };
  }, [generationState]);

  return {
    generatePreview,
    getPreviewState
  };
};
