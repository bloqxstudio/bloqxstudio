
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
        
        // Preservar cores diretas no elemento
        preserveDirectColors(settings);
        
        newElement.settings = settings;
      }
    } else if (newElement.settings) {
      // Para outros tipos de elementos, também preservar cores diretas
      preserveDirectColors(newElement.settings);
    }
    
    // Processar elementos filhos recursivamente
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = transformElementsToContainer(newElement.elements);
    }
    
    return newElement;
  });
};

// Nova função para aplicar a estrutura padrão com containers aninhados
export const applyStandardStructure = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];

  // Recolher todos os elementos originais
  const allElements = flattenElements(elements);
  
  // Criar a estrutura padrão
  const structuredComponent = [
    {
      elType: "container", // Section
      settings: {
        content_width: "full",
        flex_direction: "row",
        width: { unit: "%", size: 100 },
        margin: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
        padding: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
      },
      elements: [
        {
          elType: "container", // Padding
          settings: {
            content_width: "boxed",
            flex_direction: "column",
            padding: {
              top: { unit: "rem", size: 6, sizes: [] },
              bottom: { unit: "rem", size: 6, sizes: [] },
              left: { unit: "rem", size: 1, sizes: [] },
              right: { unit: "rem", size: 1, sizes: [] }
            },
            responsive_padding: {
              tablet: {
                top: { unit: "rem", size: 5, sizes: [] },
                bottom: { unit: "rem", size: 5, sizes: [] },
                left: { unit: "rem", size: 2, sizes: [] },
                right: { unit: "rem", size: 2, sizes: [] }
              },
              mobile: {
                top: { unit: "rem", size: 4, sizes: [] },
                bottom: { unit: "rem", size: 4, sizes: [] },
                left: { unit: "rem", size: 1, sizes: [] },
                right: { unit: "rem", size: 1, sizes: [] }
              }
            }
          },
          elements: [
            {
              elType: "container", // Row
              settings: {
                content_width: "full",
                flex_direction: "row",
                width: { unit: "%", size: 100 },
                padding: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
                margin: { top: "0", bottom: "0", left: "auto", right: "auto", unit: "px" }
              },
              elements: [
                {
                  elType: "container", // Column
                  settings: {
                    content_width: "full",
                    flex_direction: "column",
                    flex_gap: {
                      unit: "px",
                      size: 24, // Gap padrão (múltiplo de 8)
                      sizes: []
                    },
                    content_position: "center"
                  },
                  elements: organizeWidgetsInContentGroups(allElements)
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  return structuredComponent;
};

// Função auxiliar para extrair todos os widgets de uma estrutura aninhada
const flattenElements = (elements: any[]): any[] => {
  let result: any[] = [];
  
  elements.forEach(element => {
    // Se não for um container/seção/coluna, adicionar como widget
    if (element.elType !== "section" && element.elType !== "column" && element.elType !== "container") {
      // Aplicar estilos inline consistentes aos widgets
      const styledElement = applyConsistentStyles(element);
      result.push(styledElement);
    }
    
    // Processar elementos filhos recursivamente
    if (element.elements && Array.isArray(element.elements)) {
      result = result.concat(flattenElements(element.elements));
    }
  });
  
  return result;
};

// Função para aplicar estilos consistentes a widgets
const applyConsistentStyles = (widget: any): any => {
  const newWidget = { ...widget };
  
  if (!newWidget.settings) {
    newWidget.settings = {};
  }
  
  // Aplicar font-family padrão a todos os widgets com texto
  if (newWidget.elType === "widget" && 
    (newWidget.widgetType === "heading" || 
     newWidget.widgetType === "text-editor" || 
     newWidget.widgetType === "button")) {
    
    // Definir font-family como DMSANS
    newWidget.settings.typography_font_family = "DMSANS";
    
    // Aplicar cores consistentes
    if (newWidget.widgetType === "heading") {
      if (!newWidget.settings.title_color) {
        newWidget.settings.title_color = "#131313"; // Primary color
      }
    } else if (newWidget.widgetType === "text-editor") {
      if (!newWidget.settings.text_color) {
        newWidget.settings.text_color = "#454545"; // Text color
      }
    } else if (newWidget.widgetType === "button") {
      if (!newWidget.settings.button_text_color) {
        newWidget.settings.button_text_color = "#FFFFFF"; // White
      }
      if (!newWidget.settings.button_background_color) {
        newWidget.settings.button_background_color = "#131313"; // Primary color
      }
    }
  }
  
  return newWidget;
};

// Função para organizar widgets em grupos de conteúdo quando necessário
const organizeWidgetsInContentGroups = (widgets: any[]): any[] => {
  // Simplificação: colocar tudo em um único grupo de conteúdo
  // Em uma implementação mais completa, analisaríamos os tipos de widgets
  // e os agruparíamos de forma mais inteligente
  
  if (widgets.length <= 1) {
    return widgets;
  }
  
  // Para esta implementação básica, vamos agrupar todos os widgets em um content group
  return [{
    elType: "container", // Content Group
    settings: {
      content_width: "full",
      flex_direction: "column",
      flex_gap: {
        unit: "px",
        size: 16,
        sizes: []
      },
      content_position: "center",
      text_align: "center" // Centralizar texto por padrão
    },
    elements: widgets
  }];
};

// Nova função para preservar cores diretas nos elementos
const preserveDirectColors = (settings: any) => {
  if (!settings) return;
  
  // Substitui referências globais de cores pelos valores diretos
  Object.keys(settings).forEach(key => {
    // Procurar por propriedades __globals__ que afetam cores
    const globalKey = `__globals__${key}`;
    
    if (settings[globalKey] && typeof settings[globalKey] === 'string') {
      // Remove a referência global de cor, mantendo apenas o valor direto
      delete settings[globalKey];
      
      // Se não houver um valor de cor direta definido, definir um valor padrão
      // Isso é necessário apenas se a propriedade base de cor não estiver definida
      if (key.includes('color') && !settings[key]) {
        if (key.includes('background')) {
          settings[key] = '#ffffff'; // Branco como valor padrão para fundos
        } else {
          settings[key] = '#333333'; // Cinza escuro como valor padrão para textos
        }
      }
    }
  });
  
  // Processar recursivamente objetos aninhados que podem conter cores
  Object.keys(settings).forEach(key => {
    if (settings[key] && typeof settings[key] === 'object' && !Array.isArray(settings[key])) {
      preserveDirectColors(settings[key]);
    }
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
    // Preservar propriedades de cores mesmo se parecerem vazias
    const isColorProperty = key.includes('color') || key.includes('_color');
    
    // Ignorar propriedades que começam com '__', exceto __globals__ quando é necessário preservar cores
    if (key.startsWith('__') && (!isColorProperty || !key.includes('__globals__'))) {
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
    } else if (isColorProperty) {
      // Preservar propriedades de cores mesmo se o valor for vazio
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
      
      // Propriedades de cores a preservar sempre
      const colorProps = [
        'color', 'background_color', 'button_background_color', 
        'title_color', 'button_text_color', 'heading_color',
        'text_color', 'border_color'
      ];
      
      // Copiar apenas propriedades essenciais
      Object.keys(newElement.settings).forEach(key => {
        const isEssential = essentialProps.some(prop => key.includes(prop));
        const isLayout = layoutProps.some(prop => key.includes(prop));
        const isColor = colorProps.some(prop => key.includes(prop));
        
        // Remover propriedades começando com '__globals__' e certos prefixos
        const isGlobal = key.startsWith('__globals__');
        const isUnwanted = ['_motion_fx', 'animation', 'motion_fx', 'background_overlay', 'custom_css'].some(
          prefix => key.includes(prefix)
        );
        
        if ((isEssential || isLayout || isColor) && !isGlobal && !isUnwanted) {
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
