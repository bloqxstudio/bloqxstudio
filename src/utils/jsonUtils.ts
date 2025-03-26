export const cleanElementorJson = (dirtyJson: string, removeStyles: boolean = false): string => {
  try {
    const parsed = JSON.parse(dirtyJson);
    const cleaned = formatElementorJson(parsed, removeStyles);
    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Error cleaning JSON:", e);
    return dirtyJson;
  }
};

export const validateJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateElementorJson = (jsonObj: any): boolean => {
  // Validate basic structure
  if (!jsonObj || typeof jsonObj !== 'object') return false;
  if (jsonObj.type !== "elementor") return false;
  if (!Array.isArray(jsonObj.elements)) return false;
  
  // Additional validations can be added here
  return true;
};

// Main formatter function that applies all formatting rules
export const formatElementorJson = (jsonObj: any, removeStyles: boolean = false): any => {
  if (!jsonObj || typeof jsonObj !== 'object') return jsonObj;
  
  // Ensure basic structure
  const formatted = {
    type: "elementor",
    siteurl: jsonObj.siteurl || "https://example.com/",
    elements: Array.isArray(jsonObj.elements) ? jsonObj.elements : []
  };
  
  // Format elements recursively
  formatted.elements = formatElements(formatted.elements, "", removeStyles);
  
  return formatted;
};

// Recursively format elements
const formatElements = (elements: any[], parentIndex = "", removeStyles: boolean = false): any[] => {
  return elements.map((element, index) => {
    const currentIndex = parentIndex ? `${parentIndex}_${index + 1}` : `${index + 1}`;
    
    // Format current element
    const formatted = cleanElement(element, currentIndex, removeStyles);
    
    // Format child elements if they exist
    if (Array.isArray(formatted.elements) && formatted.elements.length > 0) {
      formatted.elements = formatElements(formatted.elements, currentIndex, removeStyles);
    }
    
    return formatted;
  });
};

// Clean a single element
const cleanElement = (element: any, index: string, removeStyles: boolean = false): any => {
  if (!element || typeof element !== 'object') return element;
  
  const result = { ...element };
  
  // Add title based on type and index
  const elementType = element.elType || "unknown";
  const widgetType = element.widgetType || "";
  result._title = `${index.padStart(2, '0')}_${elementType}${widgetType ? `_${widgetType}` : ""}`;
  
  // Clean settings
  if (result.settings && typeof result.settings === 'object') {
    result.settings = cleanSettings(result.settings, removeStyles);
  }
  
  // Copy only necessary properties
  const cleanedElement: any = {
    elType: result.elType,
    _title: result._title
  };
  
  // Add widgetType if it exists
  if (result.widgetType) {
    cleanedElement.widgetType = result.widgetType;
  }
  
  // Add cleaned settings
  if (result.settings) {
    cleanedElement.settings = result.settings;
  }
  
  // Add elements array if it exists
  if (Array.isArray(result.elements)) {
    cleanedElement.elements = result.elements;
  }
  
  return cleanedElement;
};

// Style-related properties to remove when in style stripping mode
const styleProperties = [
  'padding', 'margin', 'color', 'background_', 'border', 'box_shadow', 'typography',
  'text_align', 'align', 'font_size', 'font_weight', 'line_height', 'letter_spacing',
  'text_color', 'text_shadow', 'text_stroke', 'text_decoration', 'text_transform',
  'style', 'animation', 'hover_animation', 'hover_', 'space_between', 'css_filters',
  'custom_css', 'css_classes', 'height', 'min_height', 'width', 'min_width', 'max_width',
  'image_size', 'size', 'gap', 'item_gap', 'column_gap', 'row_gap', 'vertical_align',
  'horizontal_align', 'flex_', 'link_hover_', 'icon_color', 'icon_size', 'icon_padding',
  'overlay_', 'gradient_', 'rotate', 'transform', 'border_radius', 'image_hover_',
  'image_border_radius', 'css_background_animation', 'custom_height', 'custom_width',
  'item_width', 'position', 'overflow', 'z_index', 'color_', '_color', '_typography'
];

// Check if a property is style-related
const isStyleProperty = (key: string): boolean => {
  return styleProperties.some(prop => key.includes(prop));
};

// Check if a property should be removed
const shouldRemoveProperty = (key: string, removeStyles: boolean = false): boolean => {
  const removePatterns = [
    '_motion_fx',
    '_transform_',
    '_mask_',
    '_background_hover_',
    '_parallax',
    'responsive',
    'advanced_rules',
    '__globals__'
  ];
  
  // For basic cleaning, remove only the standard unnecessary properties
  if (!removeStyles) {
    return removePatterns.some(pattern => key.includes(pattern));
  }
  
  // For style stripping mode, also remove all style-related properties
  return removePatterns.some(pattern => key.includes(pattern)) || isStyleProperty(key);
};

// Clean settings object by removing unnecessary properties
const cleanSettings = (settings: any, removeStyles: boolean = false): any => {
  if (!settings || typeof settings !== 'object') return settings;
  
  const cleanedSettings: any = {};
  
  // Process each setting
  Object.entries(settings).forEach(([key, value]) => {
    // Skip properties to remove
    if (shouldRemoveProperty(key, removeStyles)) return;
    
    // Keep content-related properties even in style stripping mode
    const contentProperties = ['title', 'editor', 'item_title', 'heading_title', 'text', 'html', 'content', 'description', 'url', 'link', 'image', 'selected_icon'];
    
    if (removeStyles && !contentProperties.some(prop => key.includes(prop)) && typeof value === 'object' && value !== null) {
      // For non-content objects, check if they're style-related
      if (isStyleProperty(key)) return;
    }
    
    // Normalize values
    const normalizedValue = normalizeValue(value, removeStyles);
    
    // Only add non-empty values
    if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== '') {
      cleanedSettings[key] = normalizedValue;
    }
  });
  
  return cleanedSettings;
};

// Normalize values like units, padding, etc.
const normalizeValue = (value: any, removeStyles: boolean = false): any => {
  if (value === null || value === undefined) return null;
  
  // If it's an object with unit properties, normalize
  if (typeof value === 'object' && value !== null) {
    // Handle unit objects
    if (value.unit && (typeof value.size === 'number' || typeof value.size === 'string')) {
      // Convert string numbers to actual numbers
      const size = typeof value.size === 'string' ? parseFloat(value.size) : value.size;
      
      // In style stripping mode, return null for unit objects
      if (removeStyles) return null;
      
      return { unit: value.unit, size };
    }
    
    // Handle padding/margin objects with top, right, bottom, left
    if ('top' in value || 'right' in value || 'bottom' in value || 'left' in value) {
      // In style stripping mode, return null for spacing objects
      if (removeStyles) return null;
      
      const result: any = {};
      ['top', 'right', 'bottom', 'left'].forEach(direction => {
        if (direction in value) {
          result[direction] = typeof value[direction] === 'string' 
            ? parseFloat(value[direction]) 
            : value[direction];
        }
      });
      if ('unit' in value) {
        result.unit = value.unit;
      }
      return result;
    }
    
    // Recursively process object properties
    const result: any = {};
    Object.entries(value).forEach(([k, v]) => {
      // Skip style properties in style stripping mode
      if (removeStyles && isStyleProperty(k)) return;
      
      // Skip empty values
      const normalized = normalizeValue(v, removeStyles);
      if (normalized !== null && normalized !== undefined && normalized !== '') {
        result[k] = normalized;
      }
    });
    return Object.keys(result).length > 0 ? result : null;
  }
  
  // Return primitives as is
  return value;
};
