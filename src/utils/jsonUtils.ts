
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

    // Sempre transformar elementos para container
    elements = transformElementsToContainer(elements);

    // Formato básico
    const cleaned = {
      type: "elementor",
      siteurl: jsonObj.siteurl || "https://example.com/",
      elements: elements || []
    };

    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Erro ao limpar JSON:", e);
    return jsonString; // Retornar o original em caso de erro
  }
};

// Função para transformar todos os elType para "container"
const transformElementsToContainer = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];
  
  return elements.map(element => {
    // Clonar o elemento para não modificar o original
    const newElement = { ...element };
    
    // Se o elemento for uma seção, transformar em container
    if (newElement.elType === "section") {
      newElement.elType = "container";
      
      // Ajustar configurações para container
      if (newElement.settings) {
        // Configurações específicas de container
        newElement.settings = {
          ...newElement.settings,
          content_width: newElement.settings.content_width || {
            unit: "px",
            size: 1140,
            sizes: []
          },
          flex_gap: newElement.settings.flex_gap || {
            unit: "px",
            size: 10,
            sizes: []
          }
        };
      }
    }
    
    // Processar elementos filhos recursivamente
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = transformElementsToContainer(newElement.elements);
    }
    
    return newElement;
  });
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
      
      newElement.settings = cleanSettings;
    }
    
    // Process child elements recursively
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = removeStyleProperties(newElement.elements, shouldRemoveStyles);
    }
    
    return newElement;
  });
};
