/**
 * Enhanced JSON cleaning utilities that preserve styles
 */
import { validateJson } from './validators';
import { transformElementsToContainer, removeEmptyProperties } from './transformers';
import { extractCompleteStyles, mergeStylesIntoJson } from '../elementor/styleExtractor';

// Enhanced version of cleanElementorJson that preserves styles
export const cleanElementorJsonWithStyles = (
  jsonString: string, 
  htmlContent?: string,
  removeStyles = false, 
  wrapInContainer = true, 
  applyStructure = false
): string => {
  try {
    if (!validateJson(jsonString)) {
      throw new Error('Formato JSON inválido');
    }

    // Extract styles from HTML if available
    let styleData = null;
    if (htmlContent && !removeStyles) {
      styleData = extractCompleteStyles(htmlContent);
    }

    const jsonObj = JSON.parse(jsonString);
    let elements = [];
    
    // Determine where elements are located based on structure
    if (jsonObj.type === "elementor" && Array.isArray(jsonObj.elements)) {
      elements = jsonObj.elements;
    } else if (jsonObj.content && Array.isArray(jsonObj.content)) {
      elements = jsonObj.content;
    } else if (Array.isArray(jsonObj) && jsonObj.length > 0 && jsonObj[0].elType) {
      elements = jsonObj;
    } else if (jsonObj.content && jsonObj.page_settings) {
      elements = [jsonObj.content];
    } else {
      if (Array.isArray(jsonObj) && jsonObj.length > 0) {
        elements = jsonObj;
      } else {
        throw new Error('Estrutura JSON incompatível');
      }
    }

    // Transform elements while preserving styles
    if (applyStructure) {
      elements = applyStandardStructureWithStyles(elements);
    } else {
      elements = transformElementsToContainerWithStyles(elements);
    }

    // Create clean JSON structure
    const cleaned = {
      type: "elementor",
      siteurl: jsonObj.siteurl || "https://bloqxstudio.com/",
      elements: elements || [],
      globals: jsonObj.globals || {}
    };

    // Remove empty properties but preserve style properties
    const optimizedCleaned = removeEmptyPropertiesPreservingStyles(cleaned);
    
    let result = JSON.stringify(optimizedCleaned);
    
    // Merge extracted styles if available
    if (styleData && !removeStyles) {
      result = mergeStylesIntoJson(result, styleData);
    }

    return result;
  } catch (e) {
    console.error("Erro ao limpar JSON:", e);
    return jsonString;
  }
};

// Enhanced transformer that preserves styles
const transformElementsToContainerWithStyles = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];
  
  return elements.map(element => {
    const newElement = { ...element };
    
    if (newElement.elType === "section" || newElement.elType === "column") {
      newElement.elType = "container";
      
      if (newElement.settings) {
        const settings = { ...newElement.settings };
        
        // Apply container configurations while preserving existing styles
        settings.content_width = settings.content_width || "boxed";
        settings.flex_direction = settings.flex_direction || "auto";
        settings.flex_wrap = settings.flex_wrap || "disabled";
        
        if (!settings.content_position) {
          settings.content_position = "center";
        }
        
        if (!settings.flex_gap) {
          settings.flex_gap = { unit: "px", size: 10 };
        }
        
        // Preserve all existing style properties
        preserveAllStyleProperties(settings);
        
        newElement.settings = settings;
      }
    } else if (newElement.settings) {
      preserveAllStyleProperties(newElement.settings);
    }
    
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = transformElementsToContainerWithStyles(newElement.elements);
    }
    
    return newElement;
  });
};

// Apply standard structure while preserving styles
const applyStandardStructureWithStyles = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];

  const allElements = flattenElementsPreservingStyles(elements);
  
  const structuredComponent = [
    {
      elType: "container",
      settings: {
        content_width: "full",
        flex_direction: "row",
        width: { unit: "%", size: 100 },
        margin: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
        padding: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
      },
      elements: [
        {
          elType: "container",
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
              elType: "container",
              settings: {
                content_width: "full",
                flex_direction: "row",
                width: { unit: "%", size: 100 },
                padding: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
                margin: { top: "0", bottom: "0", left: "auto", right: "auto", unit: "px" }
              },
              elements: [
                {
                  elType: "container",
                  settings: {
                    content_width: "full",
                    flex_direction: "column",
                    flex_gap: {
                      unit: "px",
                      size: 24,
                      sizes: []
                    },
                    content_position: "center"
                  },
                  elements: organizeWidgetsWithStyles(allElements)
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

// Flatten elements while preserving all styles
const flattenElementsPreservingStyles = (elements: any[]): any[] => {
  let result: any[] = [];
  
  elements.forEach(element => {
    if (element.elType !== "section" && element.elType !== "column" && element.elType !== "container") {
      const styledElement = applyConsistentStylesPreserving(element);
      result.push(styledElement);
    }
    
    if (element.elements && Array.isArray(element.elements)) {
      result = result.concat(flattenElementsPreservingStyles(element.elements));
    }
  });
  
  return result;
};

// Apply consistent styles while preserving existing ones
const applyConsistentStylesPreserving = (widget: any): any => {
  const newWidget = { ...widget };
  
  if (!newWidget.settings) {
    newWidget.settings = {};
  }
  
  // Only apply default styles if they don't already exist
  if (newWidget.elType === "widget" && 
    (newWidget.widgetType === "heading" || 
     newWidget.widgetType === "text-editor" || 
     newWidget.widgetType === "button")) {
    
    // Set default font-family only if not already set
    if (!newWidget.settings.typography_font_family) {
      newWidget.settings.typography_font_family = "DMSANS";
    }
    
    // Apply default colors only if not already set
    if (newWidget.widgetType === "heading" && !newWidget.settings.title_color) {
      newWidget.settings.title_color = "#131313";
    } else if (newWidget.widgetType === "text-editor" && !newWidget.settings.text_color) {
      newWidget.settings.text_color = "#454545";
    } else if (newWidget.widgetType === "button") {
      if (!newWidget.settings.button_text_color) {
        newWidget.settings.button_text_color = "#FFFFFF";
      }
      if (!newWidget.settings.button_background_color) {
        newWidget.settings.button_background_color = "#131313";
      }
    }
  }
  
  return newWidget;
};

// Organize widgets while preserving styles
const organizeWidgetsWithStyles = (widgets: any[]): any[] => {
  if (widgets.length <= 1) {
    return widgets;
  }
  
  return [{
    elType: "container",
    settings: {
      content_width: "full",
      flex_direction: "column",
      flex_gap: {
        unit: "px",
        size: 16,
        sizes: []
      },
      content_position: "center",
      text_align: "center"
    },
    elements: widgets
  }];
};

// Preserve all style properties
const preserveAllStyleProperties = (settings: any) => {
  if (!settings) return;
  
  // List of critical style properties that should never be removed
  const criticalStyleProperties = [
    'color', 'background_color', 'background_image', 'background_gradient',
    'typography_font_family', 'typography_font_size', 'typography_font_weight',
    'typography_line_height', 'typography_letter_spacing',
    'padding', 'margin', 'border_width', 'border_color', 'border_radius',
    'box_shadow', 'text_shadow', 'transform', 'transition',
    'width', 'height', 'max_width', 'min_height',
    'flex_direction', 'flex_wrap', 'justify_content', 'align_items',
    'gap', 'flex_gap', 'row_gap', 'column_gap',
    'animation_name', 'animation_duration', 'animation_delay',
    'motion_fx_translateY_effect', 'motion_fx_translateX_effect',
    'motion_fx_rotateZ_effect', 'motion_fx_scale_effect',
    '_tablet', '_mobile' // Responsive variants
  ];
  
  // Preserve global color references but convert to direct values when possible
  Object.keys(settings).forEach(key => {
    const globalKey = `__globals__${key}`;
    
    // Keep global references for critical properties
    if (settings[globalKey] && criticalStyleProperties.some(prop => key.includes(prop))) {
      // Keep the global reference for now - it will be resolved later
      return;
    }
    
    // For non-critical properties, remove globals but keep direct values
    if (settings[globalKey] && !criticalStyleProperties.some(prop => key.includes(prop))) {
      delete settings[globalKey];
    }
  });
  
  // Process nested objects recursively
  Object.keys(settings).forEach(key => {
    if (settings[key] && typeof settings[key] === 'object' && !Array.isArray(settings[key])) {
      preserveAllStyleProperties(settings[key]);
    }
  });
};

// Enhanced removeEmptyProperties that preserves style properties
const removeEmptyPropertiesPreservingStyles = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeEmptyPropertiesPreservingStyles(item))
              .filter(item => item !== null && item !== undefined);
  }
  
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    // Always preserve style-related properties
    const isStyleProperty = key.includes('color') || key.includes('typography') || 
                           key.includes('padding') || key.includes('margin') ||
                           key.includes('border') || key.includes('shadow') ||
                           key.includes('background') || key.includes('animation') ||
                           key.includes('transform') || key.includes('transition') ||
                           key.includes('flex') || key.includes('gap') ||
                           key.includes('width') || key.includes('height') ||
                           key.includes('_tablet') || key.includes('_mobile');
    
    // Skip certain __globals__ but keep style-related ones
    if (key.startsWith('__globals__') && !isStyleProperty) {
      return;
    }
    
    if (value && typeof value === 'object') {
      if (Object.keys(value).length === 0 && !isStyleProperty) {
        return;
      }
      
      // For style properties with unit/size structure, preserve even if some values are empty
      if (isStyleProperty && value.unit !== undefined) {
        result[key] = value;
        return;
      }
      
      if (Array.isArray(value) && value.length === 0 && !isStyleProperty) {
        return;
      }
      
      const cleaned = removeEmptyPropertiesPreservingStyles(value);
      
      if (cleaned && typeof cleaned === 'object' && Object.keys(cleaned).length === 0 && !isStyleProperty) {
        return;
      }
      
      result[key] = cleaned;
    } else if (value !== '' && value !== null && value !== undefined) {
      result[key] = value;
    } else if (isStyleProperty) {
      // Preserve style properties even if empty
      result[key] = value;
    }
  });
  
  return result;
};
