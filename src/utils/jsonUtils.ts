
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
  if (jsonObj.type !== "elementor") return false;
  if (!Array.isArray(jsonObj.elements)) return false;
  
  return true;
};

export const cleanElementorJson = (jsonString: string, removeStyles = false): string => {
  try {
    // Validar primeiro
    if (!validateJson(jsonString)) {
      throw new Error('Formato JSON inválido');
    }

    // Analisar o JSON
    const jsonObj = JSON.parse(jsonString);

    // Validar que é um JSON do Elementor
    if (!validateElementorJson(jsonObj)) {
      throw new Error('Não é um JSON válido do Elementor');
    }

    // Formato básico
    const cleaned = {
      type: "elementor",
      siteurl: jsonObj.siteurl || "https://example.com/",
      elements: jsonObj.elements || []
    };

    // Se removeStyles for true, remover propriedades de estilo
    if (removeStyles) {
      cleaned.elements = removeStyleProperties(cleaned.elements);
    }

    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Erro ao limpar JSON:", e);
    return jsonString; // Retornar o original em caso de erro
  }
};

// Função para remover propriedades de estilo recursivamente
const removeStyleProperties = (elements: any[]): any[] => {
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
        'css_classes'
      ];
      
      // Propriedades de layout a preservar
      const layoutProps = [
        'width', 'height', '_element_width', '_element_custom_width', 
        'content_position', 'flex_', 'gap', 'padding', 'margin',
        '_margin', '_padding', 'size', 'flex_direction', 'flex_wrap'
      ];
      
      // Copiar apenas propriedades essenciais
      Object.keys(newElement.settings).forEach(key => {
        const isEssential = essentialProps.some(prop => key.includes(prop));
        const isLayout = !removeStyles || layoutProps.some(prop => key.includes(prop));
        
        // Remover propriedades começando com '__globals__' e certos prefixos
        const isGlobal = key.startsWith('__globals__');
        const isUnwanted = ['_motion_fx', 'animation', 'motion_fx', 'background_overlay', 'custom_css'].some(
          prefix => key.includes(prefix)
        );
        
        if ((isEssential || isLayout) && !isGlobal && !isUnwanted) {
          cleanSettings[key] = newElement.settings[key];
        }
      });
      
      // Aplicar estilo wireframe se necessário
      if (removeStyles) {
        // Aplicar classes CSS do Tailwind de acordo com o tipo de elemento
        if (element.elType === 'section' || element.elType === 'container') {
          cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' bg-gray-50 py-8 px-4';
        } else if (element.elType === 'column') {
          cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' bg-white p-4 rounded';
        } else if (element.widgetType) {
          // Aplicar classes de acordo com o tipo de widget
          switch (element.widgetType) {
            case 'heading':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' text-xl font-bold text-gray-800';
              break;
            case 'text-editor':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' text-gray-600';
              break;
            case 'button':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' bg-blue-600 text-white rounded px-4 py-2';
              break;
            default:
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' bg-gray-100 p-2 rounded';
          }
        }
      }
      
      newElement.settings = cleanSettings;
    }
    
    // Processar elementos filhos recursivamente
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = removeStyleProperties(newElement.elements);
    }
    
    return newElement;
  });
};
