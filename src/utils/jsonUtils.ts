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
  
  // Add title based on type and index with Client-First naming convention
  const elementType = element.elType || "unknown";
  const widgetType = element.widgetType || "";
  
  // Create Client-First style naming based on element type
  let sectionPrefix = "";
  let componentName = "";
  
  if (elementType === "section") {
    componentName = "section";
    sectionPrefix = `section${index}`;
  } else if (elementType === "column") {
    componentName = "column";
  } else if (widgetType) {
    // Convert widget type to client-first naming
    componentName = widgetType.replace(/[-_]/g, '').toLowerCase();
  }
  
  // Create a client-first style class name
  const clientFirstPrefix = `${sectionPrefix ? sectionPrefix : componentName}${index}`;
  
  // Set component title with semantic naming
  if (elementType === "section") {
    result._title = `${clientFirstPrefix}_wrapper`;
  } else if (elementType === "column") {
    result._title = `${clientFirstPrefix}_container`;
  } else if (widgetType) {
    switch (widgetType) {
      case "heading":
        result._title = `${clientFirstPrefix}_heading`;
        break;
      case "text-editor":
        result._title = `${clientFirstPrefix}_text`;
        break;
      case "button":
        result._title = `${clientFirstPrefix}_btn`;
        break;
      case "image":
        result._title = `${clientFirstPrefix}_image`;
        break;
      default:
        result._title = `${clientFirstPrefix}_${widgetType.replace(/[-_]/g, '-')}`;
    }
  } else {
    result._title = `${clientFirstPrefix}_${elementType}`;
  }
  
  // Clean settings
  if (result.settings && typeof result.settings === 'object') {
    result.settings = cleanSettings(result.settings, removeStyles, elementType, widgetType);
    
    // Add client-first class names if removing styles (applying wireframe)
    if (removeStyles && result.settings) {
      // Apply Client-First naming convention CSS classes
      if (!result.settings.css_classes) {
        result.settings.css_classes = '';
      }
      
      if (elementType === "section") {
        // Add section class
        result.settings.css_classes += ` ${clientFirstPrefix}_wrapper section-padding`;
      } else if (elementType === "column") {
        // Add column class
        result.settings.css_classes += ` ${clientFirstPrefix}_container`;
      } else if (widgetType) {
        // Add appropriate class based on widget type
        if (widgetType === "heading") {
          result.settings.css_classes += ` ${clientFirstPrefix}_heading`;
        } else if (widgetType === "text-editor") {
          result.settings.css_classes += ` ${clientFirstPrefix}_text`;
        } else if (widgetType === "button") {
          result.settings.css_classes += ` ${clientFirstPrefix}_btn btn_primary`;
        } else if (widgetType === "image") {
          result.settings.css_classes += ` ${clientFirstPrefix}_image-wrapper`;
        } else {
          result.settings.css_classes += ` ${clientFirstPrefix}_${widgetType.replace(/[-_]/g, '-')}`;
        }
      }
      
      // Trim and clean up classes
      result.settings.css_classes = result.settings.css_classes.trim().replace(/\s+/g, ' ');
    }
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

// List of properties that affect layout and should be preserved
const layoutProperties = [
  'layout', 'content_width', 'custom_width', 'gap', 'column_gap', 'row_gap',
  '_element_width', '_element_custom_width', 'content_position', 'alignment',
  'space_between_widgets', 'position', 'width', 'height', 'flex_', 'display',
  'content_align', 'justify_content', 'align_items', 'align_content',
  'flex_direction', 'flex_wrap', 'grid_template_columns', 'grid_column_gap',
  'grid_row_gap', 'element_width', 'size_tablet', 'size_mobile', 'flex_grow',
  'columns_gap', 'rows_gap', 'structure', 'responsive_settings', 'container_type'
];

// Style-related properties to remove when in style stripping mode
const styleProperties = [
  'color', 'background_', 'border', 'box_shadow', 'typography',
  'text_shadow', 'text_stroke', 'text_decoration', 'text_transform',
  'style', 'animation', 'hover_animation', 'hover_', 'css_filters',
  'custom_css', 'image_size', 'icon_color', 'icon_size', 'icon_padding',
  'overlay_', 'gradient_', 'rotate', 'transform', 'border_radius', 'image_hover_',
  'image_border_radius', 'css_background_animation',
  'item_width', 'overflow', 'z_index', 'color_', '_color', '_typography'
];

// Standard wireframe style properties to apply when removing custom styles
const wireframeStyleDefaults = {
  // Top-level sections
  section: {
    background_color: "#F7F6F3",
    border_radius: { size: 4, unit: 'px' },
    box_shadow_box_shadow_type: "yes",
    box_shadow_box_shadow: {
      horizontal: 0, vertical: 2, blur: 10, spread: 0, 
      color: "rgba(0, 0, 0, 0.05)", position: "outside"
    }
  },
  // Column elements
  column: {
    background_color: "#FFFFFF",
    border_radius: { size: 4, unit: 'px' },
    box_shadow_box_shadow_type: "yes",
    box_shadow_box_shadow: {
      horizontal: 0, vertical: 2, blur: 5, spread: 0, 
      color: "rgba(0, 0, 0, 0.05)", position: "outside"
    },
  },
  // Text elements
  heading: {
    title_color: "#444444",
    typography_typography: "custom",
  },
  'text-editor': {
    text_color: "#444444",
    typography_typography: "custom",
  },
  // Interactive elements
  button: {
    background_color: "#FFFFFF",
    button_text_color: "#000000",
    border_border: "solid",
    border_width: { top: "1", right: "1", bottom: "1", left: "1", unit: 'px' },
    border_color: "#000000",
    border_radius: { size: 4, unit: 'px' }
  },
  // Media elements
  image: {
    background_color: "#E3E1DC",
    border_radius: { size: 4, unit: 'px' }
  },
  // Default for any other element type
  default: {
    background_color: "#FFFFFF",
    border_radius: { size: 4, unit: 'px' }
  }
};

// Check if a property is style-related
const isStyleProperty = (key: string): boolean => {
  return styleProperties.some(prop => key.includes(prop));
};

// Check if a property is layout-related
const isLayoutProperty = (key: string): boolean => {
  return layoutProperties.some(prop => key.includes(prop));
};

// Check if a property should be removed
const shouldRemoveProperty = (key: string, removeStyles: boolean = false): boolean => {
  const removePatterns = [
    '_motion_fx',
    '_transform_',
    '_mask_',
    '_background_hover_',
    '_parallax',
    'advanced_rules',
    '__globals__'
  ];
  
  // For basic cleaning, remove only the standard unnecessary properties
  if (!removeStyles) {
    return removePatterns.some(pattern => key.includes(pattern));
  }
  
  // For style stripping mode, also remove all style-related properties
  // but preserve layout properties
  return (removePatterns.some(pattern => key.includes(pattern)) || 
          (isStyleProperty(key) && !isLayoutProperty(key)));
};

// Apply wireframe styles based on widget type
const applyWireframeStyles = (settings: any, elType: string, widgetType: string): any => {
  const result = { ...settings };
  
  // Determine which default styles to apply
  let defaultStyles;
  
  if (widgetType && wireframeStyleDefaults[widgetType]) {
    defaultStyles = wireframeStyleDefaults[widgetType];
  } else if (elType && wireframeStyleDefaults[elType]) {
    defaultStyles = wireframeStyleDefaults[elType];
  } else {
    defaultStyles = wireframeStyleDefaults.default;
  }
  
  // Apply the default styles
  return { ...result, ...defaultStyles };
};

// Clean settings object by removing unnecessary properties
const cleanSettings = (settings: any, removeStyles: boolean = false, elType: string = '', widgetType: string = ''): any => {
  if (!settings || typeof settings !== 'object') return settings;
  
  const cleanedSettings: any = {};
  
  // Process each setting
  Object.entries(settings).forEach(([key, value]) => {
    // Skip properties to remove
    if (shouldRemoveProperty(key, removeStyles)) return;
    
    // Keep content-related properties even in style stripping mode
    const contentProperties = [
      'title', 'editor', 'item_title', 'heading_title', 'text', 'html', 
      'content', 'description', 'url', 'link', 'image', 'selected_icon', 
      'css_classes', 'padding', 'margin'
    ];
    
    // Always preserve layout-related properties
    const shouldKeep = contentProperties.some(prop => key.includes(prop)) || 
                      isLayoutProperty(key);
    
    if (removeStyles && !shouldKeep && typeof value === 'object' && value !== null) {
      // For non-content objects, check if they're style-related
      if (isStyleProperty(key)) return;
    }
    
    // Normalize values
    const normalizedValue = normalizeValue(value, removeStyles, key);
    
    // Only add non-empty values
    if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== '') {
      cleanedSettings[key] = normalizedValue;
    }
  });
  
  // If we're removing styles, apply wireframe styles
  if (removeStyles) {
    return applyWireframeStyles(cleanedSettings, elType, widgetType);
  }
  
  return cleanedSettings;
};

// Normalize values like units, padding, etc.
const normalizeValue = (value: any, removeStyles: boolean = false, key: string = ''): any => {
  if (value === null || value === undefined) return null;
  
  // Special handling for layout-related properties that should be preserved
  const isLayoutRelated = isLayoutProperty(key);
  
  // If it's an object with unit properties, normalize
  if (typeof value === 'object' && value !== null) {
    // Handle unit objects
    if (value.unit && (typeof value.size === 'number' || typeof value.size === 'string')) {
      // Convert string numbers to actual numbers
      const size = typeof value.size === 'string' ? parseFloat(value.size) : value.size;
      
      // Preserve layout-related units even in style stripping mode
      if (removeStyles && !isLayoutRelated) return null;
      
      return { unit: value.unit, size };
    }
    
    // Handle padding/margin objects with top, right, bottom, left
    if ('top' in value || 'right' in value || 'bottom' in value || 'left' in value) {
      // Always preserve spacing units as they affect layout
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
      if (removeStyles && isStyleProperty(k) && !isLayoutProperty(k)) return;
      
      // Skip empty values
      const normalized = normalizeValue(v, removeStyles, k);
      if (normalized !== null && normalized !== undefined && normalized !== '') {
        result[k] = normalized;
      }
    });
    return Object.keys(result).length > 0 ? result : null;
  }
  
  // Return primitives as is
  return value;
};
