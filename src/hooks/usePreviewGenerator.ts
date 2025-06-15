
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Component } from '@/core/types';

interface PreviewGenerationResult {
  previewUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  method?: 'svg' | 'fallback';
}

export const usePreviewGenerator = () => {
  const [generationState, setGenerationState] = useState<Record<string, PreviewGenerationResult>>({});

  const generatePreview = useCallback(async (component: Component): Promise<string | null> => {
    const componentId = component.id;
    
    // Se já está gerando, não gerar novamente
    if (generationState[componentId]?.isGenerating) {
      return null;
    }

    // Se já tem preview, não regenerar
    if (generationState[componentId]?.previewUrl) {
      return generationState[componentId].previewUrl;
    }

    setGenerationState(prev => ({
      ...prev,
      [componentId]: { previewUrl: null, isGenerating: true, error: null }
    }));

    try {
      // Gerar SVG simples baseado nos dados do componente
      const svgPreview = generateSimpleSVGPreview(component);
      
      setGenerationState(prev => ({
        ...prev,
        [componentId]: { 
          previewUrl: svgPreview, 
          isGenerating: false, 
          error: null,
          method: 'svg'
        }
      }));

      return svgPreview;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setGenerationState(prev => ({
        ...prev,
        [componentId]: { 
          previewUrl: null, 
          isGenerating: false, 
          error: errorMessage,
          method: 'fallback'
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
    } else {
      setGenerationState({});
    }
  }, []);

  const regeneratePreview = useCallback(async (component: Component): Promise<string | null> => {
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

// Função para gerar SVG simples baseado no componente
function generateSimpleSVGPreview(component: Component): string {
  const { title, category } = component;
  
  // Cores baseadas na categoria
  const categoryColors: Record<string, { primary: string; secondary: string }> = {
    'cabecalho': { primary: '#3b82f6', secondary: '#dbeafe' },
    'secoes-hero': { primary: '#8b5cf6', secondary: '#ede9fe' },
    'destaques': { primary: '#10b981', secondary: '#d1fae5' },
    'depoimentos': { primary: '#f59e0b', secondary: '#fef3c7' },
    'rodape': { primary: '#6b7280', secondary: '#f3f4f6' },
    'contato': { primary: '#06b6d4', secondary: '#cffafe' },
    'precos': { primary: '#6366f1', secondary: '#e0e7ff' },
    'equipe': { primary: '#14b8a6', secondary: '#ccfbf1' },
    'default': { primary: '#64748b', secondary: '#f1f5f9' }
  };

  const colors = categoryColors[category] || categoryColors.default;

  // Analisar JSON para detectar elementos
  let hasHeading = false;
  let hasImage = false;
  let hasButton = false;
  
  try {
    const jsonString = component.json_code || component.code || '';
    hasHeading = jsonString.includes('heading') || jsonString.includes('title');
    hasImage = jsonString.includes('image') || jsonString.includes('img');
    hasButton = jsonString.includes('button');
  } catch (error) {
    // Se não conseguir analisar, usar elementos padrão
  }

  const svgContent = `
    <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-${component.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary}"/>
          <stop offset="100%" style="stop-color:${colors.secondary}"/>
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="240" fill="url(#bg-${component.id})"/>
      
      <!-- Content container -->
      <rect x="20" y="20" width="360" height="200" rx="8" fill="white" opacity="0.9"/>
      
      <!-- Title -->
      <text x="30" y="50" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1f2937">
        ${title.length > 30 ? title.substring(0, 30) + '...' : title}
      </text>
      
      <!-- Content elements -->
      ${hasHeading ? '<rect x="30" y="70" width="200" height="12" rx="2" fill="#e5e7eb"/>' : ''}
      ${hasImage ? '<rect x="30" y="90" width="100" height="60" rx="4" fill="#d1d5db" stroke="#9ca3af" stroke-width="1"/>' : ''}
      ${hasButton ? '<rect x="30" y="170" width="80" height="30" rx="4" fill="' + colors.primary + '"/>' : ''}
      
      <!-- Category badge -->
      <rect x="300" y="25" width="80" height="20" rx="10" fill="${colors.primary}"/>
      <text x="340" y="37" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle">
        ${category.replace('-', ' ')}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}
