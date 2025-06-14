
/**
 * Advanced style extractor for Elementor components from HTML content
 */

export interface AdvancedStyleData {
  inlineStyles: Record<string, string>;
  cssClasses: string[];
  elementorSettings: Record<string, any>;
  backgroundImages: string[];
  gradients: string[];
  animations: Record<string, any>;
  responsive: Record<string, any>;
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, any>;
}

// Extract comprehensive styles from HTML content
export const extractAdvancedStyles = (htmlContent: string): AdvancedStyleData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const styleData: AdvancedStyleData = {
    inlineStyles: {},
    cssClasses: [],
    elementorSettings: {},
    backgroundImages: [],
    gradients: [],
    animations: {},
    responsive: {},
    colors: {},
    typography: {},
    spacing: {}
  };

  console.log('🎨 Iniciando extração avançada de estilos...');

  // Extract all inline styles
  const styledElements = doc.querySelectorAll('[style]');
  console.log(`📋 Encontrados ${styledElements.length} elementos com style inline`);
  
  styledElements.forEach((element, index) => {
    const style = element.getAttribute('style');
    if (style) {
      const elementKey = `element_${index}`;
      styleData.inlineStyles[elementKey] = style;
      
      // Parse individual CSS properties
      const cssProps = parseCSSProperties(style);
      
      // Extract specific style types
      Object.entries(cssProps).forEach(([prop, value]) => {
        if (prop.includes('color') || prop.includes('background-color')) {
          styleData.colors[`${elementKey}_${prop}`] = value;
        }
        
        if (prop.includes('font') || prop.includes('text') || prop.includes('line-height')) {
          styleData.typography[`${elementKey}_${prop}`] = value;
        }
        
        if (prop.includes('margin') || prop.includes('padding') || prop.includes('gap')) {
          styleData.spacing[`${elementKey}_${prop}`] = value;
        }
        
        if (value.includes('gradient')) {
          styleData.gradients.push(value);
        }
        
        if (value.includes('url(') && prop.includes('background')) {
          const urlMatch = value.match(/url\(['"](.*?)['"]\)/);
          if (urlMatch) {
            styleData.backgroundImages.push(urlMatch[1]);
          }
        }
      });
    }
  });

  // Extract CSS classes
  const elementsWithClasses = doc.querySelectorAll('[class]');
  elementsWithClasses.forEach(element => {
    const classes = element.getAttribute('class')?.split(' ') || [];
    classes.forEach(cls => {
      if (cls.trim() && !styleData.cssClasses.includes(cls.trim())) {
        styleData.cssClasses.push(cls.trim());
      }
    });
  });

  // Extract Elementor data-settings
  const elementorElements = doc.querySelectorAll('[data-settings]');
  console.log(`🎯 Encontrados ${elementorElements.length} elementos com data-settings`);
  
  elementorElements.forEach((element, index) => {
    try {
      const settingsStr = element.getAttribute('data-settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        styleData.elementorSettings[`element_${index}`] = settings;
        
        // Process specific Elementor settings
        Object.entries(settings).forEach(([key, value]) => {
          if (key.includes('_tablet') || key.includes('_mobile')) {
            styleData.responsive[key] = value;
          }
          if (key.includes('animation') || key.includes('motion')) {
            styleData.animations[key] = value;
          }
        });
      }
    } catch (e) {
      console.warn(`⚠️ Erro ao parsear data-settings do elemento ${index}:`, e);
    }
  });

  console.log('📊 Resumo da extração:', {
    inlineStyles: Object.keys(styleData.inlineStyles).length,
    cssClasses: styleData.cssClasses.length,
    elementorSettings: Object.keys(styleData.elementorSettings).length,
    backgroundImages: styleData.backgroundImages.length,
    gradients: styleData.gradients.length,
    colors: Object.keys(styleData.colors).length,
    typography: Object.keys(styleData.typography).length,
    spacing: Object.keys(styleData.spacing).length
  });

  return styleData;
};

// Parse CSS properties from style string
const parseCSSProperties = (styleStr: string): Record<string, string> => {
  const properties: Record<string, string> = {};
  const declarations = styleStr.split(';');
  
  declarations.forEach(declaration => {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex > 0) {
      const property = declaration.slice(0, colonIndex).trim();
      const value = declaration.slice(colonIndex + 1).trim();
      if (property && value) {
        properties[property] = value;
      }
    }
  });
  
  return properties;
};

// Convert advanced styles to Elementor JSON format
export const convertStylesToElementorJson = (
  styleData: AdvancedStyleData,
  title: string,
  originalContent: string
): string => {
  console.log('🔄 Convertendo estilos para formato Elementor JSON...');
  
  const elementorStructure = {
    type: "elementor",
    siteurl: "https://superelements.io/",
    elements: [
      {
        id: generateElementId(),
        elType: "section",
        settings: {
          ...extractSectionSettings(styleData),
          _title: title
        },
        elements: convertContentToElements(styleData, originalContent)
      }
    ],
    globals: extractGlobals(styleData)
  };
  
  const jsonString = JSON.stringify(elementorStructure, null, 2);
  console.log(`✅ JSON criado com ${jsonString.length} caracteres`);
  
  return jsonString;
};

// Extract section-level settings
const extractSectionSettings = (styleData: AdvancedStyleData): Record<string, any> => {
  const settings: Record<string, any> = {};
  
  // Extract background and layout settings
  if (styleData.backgroundImages.length > 0) {
    settings.background_background = 'image';
    settings.background_image = { url: styleData.backgroundImages[0] };
  }
  
  if (styleData.gradients.length > 0) {
    settings.background_background = 'gradient';
    settings.background_color = styleData.gradients[0];
  }
  
  // Extract spacing
  Object.entries(styleData.spacing).forEach(([key, value]) => {
    if (key.includes('padding')) {
      settings.padding = parseSpacingValue(value);
    }
    if (key.includes('margin')) {
      settings.margin = parseSpacingValue(value);
    }
  });
  
  return settings;
};

// Convert content to Elementor elements
const convertContentToElements = (styleData: AdvancedStyleData, content: string): any[] => {
  const elements = [];
  
  // Create a basic widget element with extracted styles
  const widgetElement = {
    id: generateElementId(),
    elType: "widget",
    widgetType: "text-editor",
    settings: {
      editor: content,
      ...extractWidgetSettings(styleData)
    }
  };
  
  elements.push(widgetElement);
  
  return elements;
};

// Extract widget-level settings
const extractWidgetSettings = (styleData: AdvancedStyleData): Record<string, any> => {
  const settings: Record<string, any> = {};
  
  // Apply typography settings
  Object.entries(styleData.typography).forEach(([key, value]) => {
    if (key.includes('font-size')) {
      settings.typography_font_size = parseTypographyValue(value);
    }
    if (key.includes('font-family')) {
      settings.typography_font_family = value;
    }
    if (key.includes('color')) {
      settings.text_color = value;
    }
  });
  
  // Apply color settings
  Object.entries(styleData.colors).forEach(([key, value]) => {
    if (key.includes('color') && !key.includes('background')) {
      settings.text_color = value;
    }
    if (key.includes('background-color')) {
      settings.background_color = value;
    }
  });
  
  return settings;
};

// Extract global settings
const extractGlobals = (styleData: AdvancedStyleData): Record<string, any> => {
  const globals: Record<string, any> = {};
  
  // Extract color scheme
  const uniqueColors = [...new Set(Object.values(styleData.colors))];
  if (uniqueColors.length > 0) {
    globals.colors = uniqueColors.slice(0, 8).reduce((acc, color, index) => {
      acc[`color_${index + 1}`] = color;
      return acc;
    }, {} as Record<string, string>);
  }
  
  return globals;
};

// Helper functions
const generateElementId = (): string => {
  return Math.random().toString(36).substr(2, 7);
};

const parseSpacingValue = (value: string): any => {
  const numericValue = parseFloat(value);
  const unit = value.replace(numericValue.toString(), '').trim() || 'px';
  
  return {
    unit: unit,
    top: numericValue,
    right: numericValue,
    bottom: numericValue,
    left: numericValue,
    isLinked: true
  };
};

const parseTypographyValue = (value: string): any => {
  const numericValue = parseFloat(value);
  const unit = value.replace(numericValue.toString(), '').trim() || 'px';
  
  return {
    unit: unit,
    size: numericValue
  };
};
