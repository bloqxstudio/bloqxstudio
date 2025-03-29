export const validateJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateElementorJson = (jsonObj: any): boolean => {
  // Validação básica da estrutura
  if (!jsonObj || typeof jsonObj !== 'object') return false;
  
  // Verificar o formato 1: estrutura com "type": "elementor"
  if (jsonObj.type === "elementor" && Array.isArray(jsonObj.elements)) {
    return true;
  }
  
  // Verificar o formato 2: estrutura com "content" contendo elementos
  if (jsonObj.content && Array.isArray(jsonObj.content)) {
    return true;
  }
  
  // Verificar o formato 3: estrutura direta de elementos
  if (Array.isArray(jsonObj) && jsonObj.length > 0 && jsonObj[0].elType) {
    return true;
  }
  
  // Verificar se é uma exportação de página do Elementor
  if (jsonObj.content && jsonObj.page_settings) {
    return true;
  }
  
  return false;
};

export const cleanElementorJson = (jsonString: string, removeStyles = false, wrapInContainer = true): string => {
  try {
    // Validar primeiro
    if (!validateJson(jsonString)) {
      throw new Error('Formato JSON inválido');
    }

    // Analisar o JSON
    const jsonObj = JSON.parse(jsonString);
    let elements = [];
    
    // Determinar onde estão os elementos com base na estrutura
    if (jsonObj.type === "elementor" && Array.isArray(jsonObj.elements)) {
      // Formato 1: estrutura com type: "elementor"
      elements = jsonObj.elements;
    } else if (jsonObj.content && Array.isArray(jsonObj.content)) {
      // Formato 2: estrutura com "content" contendo elementos
      elements = jsonObj.content;
    } else if (Array.isArray(jsonObj) && jsonObj.length > 0 && jsonObj[0].elType) {
      // Formato 3: estrutura direta de elementos
      elements = jsonObj;
    } else if (jsonObj.content && jsonObj.page_settings) {
      // Exportação de página completa
      elements = [jsonObj.content];
    } else {
      // Tente encontrar elementos aninhados de alguma forma
      if (Array.isArray(jsonObj) && jsonObj.length > 0) {
        // Pode ser um array de elementos
        elements = jsonObj;
      } else {
        throw new Error('Estrutura JSON incompatível');
      }
    }

    // Aplicar transformação para container
    if (wrapInContainer) {
      elements = transformElementsToContainer(elements);
    }

    // Formato básico
    const cleaned = {
      type: "elementor",
      siteurl: jsonObj.siteurl || "https://example.com/",
      elements: elements || []
    };

    // Se removeStyles for true, remover propriedades de estilo (mantido por compatibilidade)
    if (removeStyles) {
      cleaned.elements = removeStyleProperties(cleaned.elements, removeStyles);
    }

    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Erro ao limpar JSON:", e);
    return jsonString; // Retornar o original em caso de erro
  }
};

// Nova função para transformar todos os elType para "container"
const transformElementsToContainer = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];
  
  return elements.map(element => {
    // Clonar o elemento para não modificar o original
    const newElement = { ...element };
    
    // Se o elemento for uma seção, transformar em container
    if (newElement.elType === "section") {
      newElement.elType = "container";
    }
    
    // Processar elementos filhos recursivamente
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = transformElementsToContainer(newElement.elements);
    }
    
    return newElement;
  });
};

// Função para envolver elementos em um container
const wrapElementsInContainer = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];
  
  // Criar um container section
  const containerSection = {
    elType: "section",
    settings: {
      layout: "boxed",
      content_width: {
        unit: "px",
        size: 1140,
        sizes: []
      },
      gap: "no",
      structure: "20",
      padding: {
        unit: "px",
        top: "30",
        right: "30",
        bottom: "30",
        left: "30",
        isLinked: false
      }
    },
    elements: [
      {
        elType: "column",
        settings: {
          _column_size: 100,
          _inline_size: null,
          content_position: "top",
          space_between_widgets: "20",
          padding: {
            unit: "px",
            top: "10",
            right: "10",
            bottom: "10",
            left: "10",
            isLinked: true
          }
        },
        elements: elements
      }
    ]
  };
  
  return [containerSection];
};

// Função para remover propriedades de estilo recursivamente
const removeStyleProperties = (elements: any[], shouldRemoveStyles: boolean): any[] => {
  if (!elements || !Array.isArray(elements)) return [];
  
  return elements.map(element => {
    // Clonar o elemento
    const newElement = { ...element };
    
    // Processar configurações
    if (newElement.settings && typeof newElement.settings === 'object') {
      // Manter apenas propriedades essenciais e remover estilos
      const cleanSettings: any = {};
      
      // Lista de propriedades a manter mesmo em modo wireframe
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
        const isLayout = !shouldRemoveStyles || layoutProps.some(prop => key.includes(prop));
        
        // Remover propriedades começando com '__globals__' e certos prefixos
        const isGlobal = key.startsWith('__globals__');
        const isUnwanted = ['_motion_fx', 'animation', 'motion_fx', 'background_overlay', 'custom_css'].some(
          prefix => key.includes(prefix)
        );
        
        if ((isEssential || isLayout) && !isGlobal && !isUnwanted) {
          cleanSettings[key] = newElement.settings[key];
        }
      });
      
      if (shouldRemoveStyles) {
        // Typography and styling adjustments
        if (element.widgetType === 'heading') {
          // Maintain strong typography for headings
          cleanSettings.typography_font_family = 'Inter';
          cleanSettings.typography_font_weight = '600';
          cleanSettings.title_color = '#1F2937';

          // Specific sizes based on header type
          if (cleanSettings.header_size === 'h1') {
            cleanSettings.typography_font_size = { size: 56, unit: 'px', sizes: [] };
            cleanSettings.typography_line_height = { size: '120%', unit: 'custom', sizes: [] };
          } else if (cleanSettings.header_size === 'h2') {
            cleanSettings.typography_font_size = { size: 48, unit: 'px', sizes: [] };
            cleanSettings.typography_line_height = { size: '120%', unit: 'custom', sizes: [] };
          } else if (cleanSettings.header_size === 'h3') {
            cleanSettings.typography_font_size = { size: 36, unit: 'px', sizes: [] };
            cleanSettings.typography_line_height = { size: '130%', unit: 'custom', sizes: [] };
          } else if (cleanSettings.header_size === 'h4') {
            cleanSettings.typography_font_size = { size: 24, unit: 'px', sizes: [] };
            cleanSettings.typography_line_height = { size: '140%', unit: 'custom', sizes: [] };
          } else if (cleanSettings.header_size === 'h5' || cleanSettings.header_size === 'h6') {
            cleanSettings.typography_font_size = { size: 20, unit: 'px', sizes: [] };
            cleanSettings.typography_line_height = { size: '140%', unit: 'custom', sizes: [] };
          }
        }

        if (element.widgetType === 'text-editor') {
          cleanSettings.typography_font_family = 'Inter';
          cleanSettings.typography_font_weight = '400';
          cleanSettings.typography_font_size = { size: 18, unit: 'px', sizes: [] };
          cleanSettings.text_color = '#4B5563';
          cleanSettings.typography_line_height = { size: '150%', unit: 'custom', sizes: [] };
        }

        if (element.widgetType === 'button') {
          // Good padding for buttons
          cleanSettings.text_padding = {
            top: '16', 
            left: '32', 
            right: '32', 
            bottom: '16', 
            unit: 'px', 
            isLinked: false
          };
          
          cleanSettings.typography_font_family = 'Inter';
          cleanSettings.typography_font_weight = '500';
          cleanSettings.typography_font_size = { size: 16, unit: 'px', sizes: [] };
          
          // Primary button style
          if (!cleanSettings.text || 
              (!cleanSettings.text.includes("Learn more") && 
               !cleanSettings.text.includes("Saiba"))) {
            cleanSettings.background_color = '#0047FF';
            cleanSettings.button_text_color = '#FFFFFF';
            cleanSettings.border_radius = { 
              top: 8, right: 8, bottom: 8, left: 8, 
              unit: 'px', 
              isLinked: true 
            };
          } else {
            // Secondary button style
            cleanSettings.background_color = '#FFFFFF';
            cleanSettings.button_text_color = '#344054';
            cleanSettings.border_color = '#D0D5DD';
            cleanSettings.border_width = { 
              top: 1, right: 1, bottom: 1, left: 1, 
              unit: 'px', 
              isLinked: true 
            };
            cleanSettings.border_radius = { 
              top: 8, right: 8, bottom: 8, left: 8, 
              unit: 'px', 
              isLinked: true 
            };
          }
        }

        // Image placeholder
        if (element.widgetType === 'image') {
          if (cleanSettings.image && cleanSettings.image.url) {
            cleanSettings.image.url = 'https://placehold.co/800x640/F2F4F7/4A5568?text=Image';
          }
        }
      }
      
      newElement.settings = cleanSettings;
    }
    
    // Process child elements recursively
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = removeStyleProperties(newElement.elements, shouldRemoveStyles);
    }
    
    return newElement;
  });
};
