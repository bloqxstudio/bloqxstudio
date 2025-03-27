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
      cleaned.elements = removeStyleProperties(cleaned.elements, removeStyles);
    }

    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Erro ao limpar JSON:", e);
    return jsonString; // Retornar o original em caso de erro
  }
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
            top: '14', 
            left: '24', 
            right: '24', 
            bottom: '14', 
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
