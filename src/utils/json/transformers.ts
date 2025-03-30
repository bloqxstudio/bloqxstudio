
/**
 * JSON transformation utilities for Elementor components
 */

// Função para transformar todos os elType para "container"
export const transformElementsToContainer = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];
  
  return elements.map(element => {
    // Clonar o elemento para não modificar o original
    const newElement = { ...element };
    
    // Se o elemento for uma seção ou coluna, transformar em container
    if (newElement.elType === "section" || newElement.elType === "column") {
      newElement.elType = "container";
      
      // Ajustar configurações para container de forma mais compacta
      if (newElement.settings) {
        // Configurações específicas de container conforme solicitado
        // Usar valores diretos em vez de objetos completos para reduzir tamanho
        const settings = { ...newElement.settings };
        
        // Aplicar os valores específicos solicitados
        settings.content_width = "boxed";
        settings.flex_direction = "auto";
        settings.flex_wrap = "disabled";
        
        // Manter content_position se existir, ou definir um padrão
        if (!settings.content_position) {
          settings.content_position = "center";
        }
        
        // Definir flex_gap de forma simplificada apenas se não existir
        if (!settings.flex_gap) {
          settings.flex_gap = { unit: "px", size: 10 };
        }
        
        newElement.settings = settings;
      }
    }
    
    // Processar elementos filhos recursivamente
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = transformElementsToContainer(newElement.elements);
    }
    
    return newElement;
  });
};

// Função para remover propriedades vazias recursivamente
export const removeEmptyProperties = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeEmptyProperties(item))
              .filter(item => item !== null && item !== undefined && item !== '');
  }
  
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    // Ignorar propriedades que começam com '__'
    if (key.startsWith('__')) {
      return;
    }
    
    const value = obj[key];
    
    // Verificar se é um objeto vazio
    if (value && typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        return; // Pular objetos vazios
      }
      
      // Processar objetos que têm propriedades como unit, size, etc. mas todos os valores são vazios
      if (
        value.unit !== undefined && 
        Object.keys(value).every(k => 
          k === 'unit' || 
          (k !== 'unit' && (value[k] === '' || value[k] === undefined || value[k] === null))
        )
      ) {
        return; // Pular objetos que só têm a propriedade unit com valor significativo
      }
      
      // Para arrays e objetos que têm todas as propriedades vazias
      if (Array.isArray(value) && value.length === 0) {
        return; // Pular arrays vazios
      }
      
      // Processar recursivamente
      const cleaned = removeEmptyProperties(value);
      
      // Verificar se o resultado da limpeza não está vazio
      if (cleaned && typeof cleaned === 'object' && Object.keys(cleaned).length === 0) {
        return; // Pular o resultado se estiver vazio
      }
      
      result[key] = cleaned;
    } else if (value !== '' && value !== null && value !== undefined) {
      // Manter valores primitivos não vazios
      result[key] = value;
    }
  });
  
  return result;
};

// Função para remover propriedades de estilo recursivamente
export const removeStyleProperties = (elements: any[]): any[] => {
  if (!elements || !Array.isArray(elements)) return [];
  
  return elements.map(element => {
    // Clonar o elemento
    const newElement = { ...element };
    
    // Processar configurações
    if (newElement.settings && typeof newElement.settings === 'object') {
      // Manter apenas propriedades essenciais e remover estilos
      const cleanSettings: any = {};
      
      // Lista de propriedades a manter mesmo
      const essentialProps = [
        'content_width', 'structure', '_title', 'html_tag',
        'title', 'editor', 'text', 'link', 'url', 'selected_icon',
        'css_classes', 'image', 'form_fields', 'form_name', 'email_to',
        'button_text'
      ];
      
      // Propriedades de layout a preservar
      const layoutProps = [
        'width', 'height', '_element_width', '_element_custom_width', 
        'content_position', 'flex_', 'gap', 'padding', 'margin',
        '_margin', '_padding', 'size', 'flex_direction', 'flex_wrap',
        'space', 'align', 'object-fit'
      ];
      
      // Copiar apenas propriedades essenciais
      Object.keys(newElement.settings).forEach(key => {
        const isEssential = essentialProps.some(prop => key.includes(prop));
        const isLayout = layoutProps.some(prop => key.includes(prop));
        
        // Remover propriedades começando com '__globals__' e certos prefixos
        const isGlobal = key.startsWith('__globals__');
        const isUnwanted = ['_motion_fx', 'animation', 'motion_fx', 'background_overlay', 'custom_css'].some(
          prefix => key.includes(prefix)
        );
        
        if ((isEssential || isLayout) && !isGlobal && !isUnwanted) {
          cleanSettings[key] = newElement.settings[key];
        }
      });
      
      newElement.settings = cleanSettings;
    }
    
    // Process child elements recursively
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = removeStyleProperties(newElement.elements);
    }
    
    return newElement;
  });
};
