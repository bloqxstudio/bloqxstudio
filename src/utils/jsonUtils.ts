
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
      
      // Aplicar estilo wireframe se necessário
      if (shouldRemoveStyles) {
        // Aplicar classes CSS e estilos em preto e branco de acordo com o tipo de elemento
        if (element.elType === 'section' || element.elType === 'container') {
          cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_container';
          cleanSettings.background_color = '#F3F4F6';
          cleanSettings.border_color = '#D1D5DB';
          cleanSettings.border_width = { top: 1, right: 1, bottom: 1, left: 1, unit: 'px', isLinked: true };
        } else if (element.elType === 'column') {
          cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_column';
          cleanSettings.background_color = '#FFFFFF';
          cleanSettings.border_color = '#E5E7EB';
          cleanSettings.border_width = { top: 1, right: 1, bottom: 1, left: 1, unit: 'px', isLinked: true };
        } else if (element.widgetType) {
          // Aplicar estilos comuns a todos os widgets
          cleanSettings._margin = cleanSettings._margin || { top: '0', right: '0', bottom: '8', left: '0', unit: 'px', isLinked: false };
          
          // Aplicar classes e estilos de acordo com o tipo de widget
          switch (element.widgetType) {
            case 'heading':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_heading';
              cleanSettings.title_color = '#1F2937';
              cleanSettings.typography_font_family = 'Inter';
              cleanSettings.typography_font_weight = '600';
              
              // Determinar o tamanho baseado em header_size ou primeiro caractere do título
              const headerSize = cleanSettings.header_size || 'h2';
              const titleText = cleanSettings.title || '';
              
              if (headerSize === 'h1' || (titleText.length > 0 && titleText.length < 30)) {
                cleanSettings.typography_font_size = { size: 32, unit: 'px', sizes: [] };
                cleanSettings.typography_line_height = { size: '1.2', unit: 'em', sizes: [] };
              } else if (headerSize === 'h2' || headerSize === 'div') {
                cleanSettings.typography_font_size = { size: 24, unit: 'px', sizes: [] };
                cleanSettings.typography_line_height = { size: '1.3', unit: 'em', sizes: [] };
              } else {
                cleanSettings.typography_font_size = { size: 18, unit: 'px', sizes: [] };
                cleanSettings.typography_line_height = { size: '1.4', unit: 'em', sizes: [] };
              }
              break;
              
            case 'text-editor':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_text';
              cleanSettings.text_color = '#4B5563';
              cleanSettings.typography_font_family = 'Inter';
              cleanSettings.typography_font_weight = '400';
              cleanSettings.typography_font_size = { size: 16, unit: 'px', sizes: [] };
              cleanSettings.typography_line_height = { size: '1.5', unit: 'em', sizes: [] };
              break;
              
            case 'button':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_button';
              cleanSettings.background_color = '#333333';
              cleanSettings.button_text_color = '#FFFFFF';
              cleanSettings.border_radius = { top: 8, right: 8, bottom: 8, left: 8, unit: 'px', isLinked: true };
              cleanSettings.typography_font_family = 'Inter';
              cleanSettings.typography_font_weight = '500';
              cleanSettings.typography_font_size = { size: 16, unit: 'px', sizes: [] };
              cleanSettings.button_hover_border_color = '#1F2937';
              cleanSettings.button_background_hover_color = '#1F2937';
              
              // Se for um botão secundário (com borda ou outline ou sem fundo colorido)
              if (
                cleanSettings.text && 
                (cleanSettings.text.includes("Learn") || 
                 cleanSettings.text.includes("More") || 
                 cleanSettings.text.includes("Saiba"))
              ) {
                cleanSettings.background_color = '#FFFFFF';
                cleanSettings.button_text_color = '#333333';
                cleanSettings.border_color = '#D1D5DB';
                cleanSettings.border_width = { top: 1, right: 1, bottom: 1, left: 1, unit: 'px', isLinked: true };
              }
              break;
              
            case 'image':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_image';
              
              // Manter a estrutura, mas aplicar um placeholder em tons de cinza
              if (cleanSettings.image && cleanSettings.image.url) {
                cleanSettings.image.url = 'https://placehold.co/600x400/e2e8f0/64748b';
              }
              break;
              
            case 'icon':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_icon';
              cleanSettings.primary_color = '#333333';
              cleanSettings.secondary_color = '#FFFFFF';
              break;
              
            case 'form':
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_form';
              cleanSettings.button_background_color = '#333333';
              cleanSettings.button_text_color = '#FFFFFF';
              cleanSettings.field_background_color = '#FFFFFF';
              cleanSettings.field_border_color = '#D1D5DB';
              cleanSettings.field_text_color = '#4B5563';
              cleanSettings.success_message_color = '#10B981';
              cleanSettings.error_message_color = '#EF4444';
              break;
              
            default:
              cleanSettings.css_classes = (cleanSettings.css_classes || '') + ' wf_widget';
              cleanSettings.color = '#4B5563';
              cleanSettings.background_color = '#F9FAFB';
              cleanSettings.border_color = '#E5E7EB';
              cleanSettings.border_width = { top: 1, right: 1, bottom: 1, left: 1, unit: 'px', isLinked: true };
              cleanSettings.border_radius = { top: 4, right: 4, bottom: 4, left: 4, unit: 'px', isLinked: true };
          }
        }
      }
      
      newElement.settings = cleanSettings;
    }
    
    // Processar elementos filhos recursivamente
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = removeStyleProperties(newElement.elements, shouldRemoveStyles);
    }
    
    return newElement;
  });
};
