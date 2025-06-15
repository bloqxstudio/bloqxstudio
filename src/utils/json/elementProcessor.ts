
/**
 * Element processing utilities for Elementor components
 */

// Generate unique ID for Elementor elements
const generateElementorId = (): string => {
  return Math.random().toString(36).substr(2, 7);
};

// Função para transformar todos os elType para "container" com configurações completas
export const transformElementsToContainer = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];
  
  return elements.map(element => {
    // Clonar o elemento para não modificar o original
    const newElement = { 
      ...element,
      id: element.id || generateElementorId()
    };
    
    // Se o elemento for uma seção ou coluna, transformar em container
    if (newElement.elType === "section" || newElement.elType === "column") {
      newElement.elType = "container";
      
      // Ajustar configurações para container de forma mais compacta
      if (newElement.settings) {
        const settings = { ...newElement.settings };
        
        // Configurações essenciais de container
        settings.content_width = settings.content_width || "boxed";
        settings.flex_direction = settings.flex_direction || "column";
        settings.flex_wrap = settings.flex_wrap || "nowrap";
        settings.container_type = settings.container_type || "flex";
        settings.content_position = settings.content_position || "center";
        
        // Configurações de gap se não existirem
        if (!settings.flex_gap) {
          settings.flex_gap = { 
            unit: "px", 
            size: 10,
            column: "10",
            row: "10",
            isLinked: true
          };
        }
        
        // Configurações responsivas básicas
        if (!settings.flex_direction_tablet) {
          settings.flex_direction_tablet = "column";
        }
        
        if (!settings.flex_gap_tablet) {
          settings.flex_gap_tablet = {
            column: "0",
            row: "2",
            isLinked: false,
            unit: "rem",
            size: 0
          };
        }
        
        if (!settings.flex_gap_mobile) {
          settings.flex_gap_mobile = {
            isLinked: true,
            unit: "rem"
          };
        }
        
        // Preservar cores diretas no elemento
        preserveDirectColors(settings);
        
        newElement.settings = settings;
      } else {
        // Se não há configurações, criar configurações básicas
        newElement.settings = {
          content_width: "boxed",
          flex_direction: "column",
          flex_wrap: "nowrap",
          container_type: "flex",
          content_position: "center",
          flex_gap: { unit: "px", size: 10, column: "10", row: "10", isLinked: true }
        };
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

// Função para preservar cores diretas nos elementos
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

// Função auxiliar para extrair todos os widgets de uma estrutura aninhada
export const flattenElements = (elements: any[]): any[] => {
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
