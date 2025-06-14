
/**
 * Utilities for extracting and preserving complete Elementor styles
 */

export interface ElementorStyleData {
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, any>;
  responsive: Record<string, any>;
  animations: Record<string, any>;
}

// Extract complete styles from HTML content
export const extractCompleteStyles = (htmlContent: string): ElementorStyleData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const styleData: ElementorStyleData = {
    colors: {},
    typography: {},
    spacing: {},
    responsive: {},
    animations: {}
  };

  // Extract data-settings from all Elementor elements
  const elementorElements = doc.querySelectorAll('[data-settings]');
  
  elementorElements.forEach(element => {
    try {
      const settingsStr = element.getAttribute('data-settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        
        // Extract colors
        Object.keys(settings).forEach(key => {
          if (key.includes('color') && settings[key]) {
            styleData.colors[key] = settings[key];
          }
          if (key.includes('typography') && settings[key]) {
            styleData.typography[key] = settings[key];
          }
          if (key.includes('padding') || key.includes('margin') || key.includes('gap')) {
            styleData.spacing[key] = settings[key];
          }
          if (key.includes('_tablet') || key.includes('_mobile')) {
            styleData.responsive[key] = settings[key];
          }
          if (key.includes('animation') || key.includes('motion')) {
            styleData.animations[key] = settings[key];
          }
        });
      }
    } catch (e) {
      console.warn('Error parsing element settings:', e);
    }
  });

  // Extract inline styles
  const styledElements = doc.querySelectorAll('[style]');
  styledElements.forEach(element => {
    const style = element.getAttribute('style');
    if (style) {
      const cssProperties = parseCSSStyle(style);
      Object.assign(styleData.colors, extractColorsFromCSS(cssProperties));
      Object.assign(styleData.spacing, extractSpacingFromCSS(cssProperties));
      Object.assign(styleData.typography, extractTypographyFromCSS(cssProperties));
    }
  });

  return styleData;
};

// Parse CSS style string into object
const parseCSSStyle = (styleStr: string): Record<string, string> => {
  const styles: Record<string, string> = {};
  const declarations = styleStr.split(';');
  
  declarations.forEach(declaration => {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex > 0) {
      const property = declaration.slice(0, colonIndex).trim();
      const value = declaration.slice(colonIndex + 1).trim();
      styles[property] = value;
    }
  });
  
  return styles;
};

// Extract color properties from CSS
const extractColorsFromCSS = (styles: Record<string, string>): Record<string, string> => {
  const colors: Record<string, string> = {};
  
  Object.keys(styles).forEach(prop => {
    if (prop.includes('color') || prop.includes('background')) {
      colors[prop] = styles[prop];
    }
  });
  
  return colors;
};

// Extract spacing properties from CSS
const extractSpacingFromCSS = (styles: Record<string, string>): Record<string, any> => {
  const spacing: Record<string, any> = {};
  
  Object.keys(styles).forEach(prop => {
    if (prop.includes('margin') || prop.includes('padding') || prop.includes('gap')) {
      spacing[prop] = parseSpacingValue(styles[prop]);
    }
  });
  
  return spacing;
};

// Extract typography properties from CSS
const extractTypographyFromCSS = (styles: Record<string, string>): Record<string, any> => {
  const typography: Record<string, any> = {};
  
  Object.keys(styles).forEach(prop => {
    if (prop.includes('font') || prop.includes('text') || prop.includes('line-height')) {
      typography[prop] = styles[prop];
    }
  });
  
  return typography;
};

// Parse spacing values into Elementor format
const parseSpacingValue = (value: string): any => {
  const numericValue = parseFloat(value);
  const unit = value.replace(numericValue.toString(), '').trim() || 'px';
  
  return {
    size: numericValue,
    unit: unit
  };
};

// Merge extracted styles into Elementor JSON structure
export const mergeStylesIntoJson = (jsonString: string, styleData: ElementorStyleData): string => {
  try {
    const jsonObj = JSON.parse(jsonString);
    
    // Recursively apply styles to elements
    const applyStylesToElements = (elements: any[]): any[] => {
      return elements.map(element => {
        const newElement = { ...element };
        
        if (newElement.settings) {
          // Merge extracted colors
          Object.keys(styleData.colors).forEach(colorKey => {
            if (!newElement.settings[colorKey]) {
              newElement.settings[colorKey] = styleData.colors[colorKey];
            }
          });
          
          // Merge extracted typography
          Object.keys(styleData.typography).forEach(typoKey => {
            if (!newElement.settings[typoKey]) {
              newElement.settings[typoKey] = styleData.typography[typoKey];
            }
          });
          
          // Merge extracted spacing
          Object.keys(styleData.spacing).forEach(spacingKey => {
            if (!newElement.settings[spacingKey]) {
              newElement.settings[spacingKey] = styleData.spacing[spacingKey];
            }
          });
          
          // Merge responsive settings
          Object.keys(styleData.responsive).forEach(responsiveKey => {
            if (!newElement.settings[responsiveKey]) {
              newElement.settings[responsiveKey] = styleData.responsive[responsiveKey];
            }
          });
          
          // Merge animations
          Object.keys(styleData.animations).forEach(animationKey => {
            if (!newElement.settings[animationKey]) {
              newElement.settings[animationKey] = styleData.animations[animationKey];
            }
          });
        }
        
        // Process child elements
        if (newElement.elements && Array.isArray(newElement.elements)) {
          newElement.elements = applyStylesToElements(newElement.elements);
        }
        
        return newElement;
      });
    };
    
    // Apply styles based on JSON structure
    if (jsonObj.elements && Array.isArray(jsonObj.elements)) {
      jsonObj.elements = applyStylesToElements(jsonObj.elements);
    } else if (Array.isArray(jsonObj)) {
      return JSON.stringify(applyStylesToElements(jsonObj));
    }
    
    return JSON.stringify(jsonObj);
  } catch (error) {
    console.error('Error merging styles into JSON:', error);
    return jsonString;
  }
};
