
import { getWordPressComponents } from './wordpress';
import { Component } from '@/core/types';

export const getComponents = async (): Promise<Component[]> => {
  console.log('🔍 Carregando componentes Superelements...');
  
  try {
    console.log('🌐 Buscando componentes Superelements...');
    const wpResponse = await getWordPressComponents({ 
      limit: 1000,
      page: 1 
    });
    
    console.log('📊 Resposta Superelements recebida:', {
      success: wpResponse.success,
      dataLength: wpResponse.data?.length || 0
    });
    
    if (wpResponse.success && wpResponse.data) {
      // Converter componentes WordPress para o formato Component
      const wordpressComponents = wpResponse.data.map((wpComponent, index) => {
        console.log(`🔄 Processando componente Superelements ${index + 1}:`, {
          id: wpComponent.id,
          title: wpComponent.title,
          has_preview_image: !!wpComponent.preview_image,
          preview_url: wpComponent.preview_image
        });

        return {
          id: `wp-${wpComponent.id}`,
          title: wpComponent.title || 'Sem título',
          description: wpComponent.description || '',
          category: wpComponent.category || 'geral',
          code: wpComponent.elementor_json || wpComponent.code || '',
          json_code: wpComponent.elementor_json || wpComponent.code || '',
          preview_image: wpComponent.preview_image,
          tags: wpComponent.tags || [],
          type: 'elementor',
          visibility: 'public' as const,
          created_at: wpComponent.created_at || new Date().toISOString(),
          updated_at: wpComponent.updated_at || new Date().toISOString(),
          created_by: 'wordpress-import',
          alignment: wpComponent.alignment,
          columns: wpComponent.columns,
          elements: wpComponent.elements || [],
          source: 'wordpress' as const
        };
      });

      console.log(`✅ ${wordpressComponents.length} componentes Superelements processados`);
      return wordpressComponents;
    } else {
      console.warn('⚠️ Resposta Superelements não foi bem-sucedida ou sem dados');
      return [];
    }

  } catch (error) {
    console.error('💥 Erro geral em getComponents:', error);
    return [];
  }
};

// Função simplificada para buscar por ID (opcional)
export const getComponentById = async (id: string): Promise<Component | null> => {
  try {
    const components = await getComponents();
    return components.find(comp => comp.id === id) || null;
  } catch (error) {
    console.error('Error fetching component by ID:', error);
    return null;
  }
};

// Manter outras funções existentes para compatibilidade
export const uploadComponentImage = async (file: File, path: string): Promise<string> => {
  throw new Error('Upload não disponível em modo público');
};

export const createComponent = async (componentData: any): Promise<Component> => {
  throw new Error('Criação de componentes não disponível em modo público');
};

export const updateComponent = async (id: string, componentData: FormData): Promise<Component> => {
  throw new Error('Atualização de componentes não disponível em modo público');
};

export const deleteComponent = async (id: string): Promise<void> => {
  throw new Error('Exclusão de componentes não disponível em modo público');
};
