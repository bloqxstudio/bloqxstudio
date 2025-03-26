
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
  
  // Determine element context for client-first naming
  const elementType = element.elType || "unknown";
  const widgetType = element.widgetType || "";
  
  // Determine semantic context for naming based on content or structure
  let sectionContext = determineSectionContext(element);
  let componentName = "";
  
  if (elementType === "section") {
    componentName = sectionContext || "section";
  } else if (elementType === "column") {
    componentName = "column";
  } else if (widgetType) {
    // Convert widget type to semantic naming
    componentName = convertToSemantic(widgetType);
  }
  
  // Create client-first style class name
  const sectionPrefix = elementType === "section" ? `${componentName}${index}` : "";
  const clientFirstPrefix = sectionPrefix || `${sectionContext || componentName}${index}`;
  
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
      case "icon":
        result._title = `${clientFirstPrefix}_icon`;
        break;
      case "icon-box":
        result._title = `${clientFirstPrefix}_feature`;
        break;
      case "video":
        result._title = `${clientFirstPrefix}_video`;
        break;
      case "testimonial":
        result._title = `${clientFirstPrefix}_testimonial`;
        break;
      case "tabs":
        result._title = `${clientFirstPrefix}_tabs`;
        break;
      case "accordion":
        result._title = `${clientFirstPrefix}_accordion`;
        break;
      case "form":
        result._title = `${clientFirstPrefix}_form`;
        break;
      default:
        result._title = `${clientFirstPrefix}_${widgetType.replace(/[-_]/g, '-')}`;
    }
  } else {
    result._title = `${clientFirstPrefix}_${elementType}`;
  }
  
  // Clean settings
  if (result.settings && typeof result.settings === 'object') {
    result.settings = cleanSettings(result.settings, removeStyles, elementType, widgetType, sectionContext);
    
    // Add tailwind classes when applying wireframe style (removing original styles)
    if (removeStyles && result.settings) {
      // Apply Client-First naming convention with Tailwind CSS classes
      if (!result.settings.css_classes) {
        result.settings.css_classes = '';
      }
      
      // Add appropriate Tailwind classes based on element type
      if (elementType === "section") {
        // Apply section styling with Tailwind
        result.settings.css_classes += ` ${clientFirstPrefix}_wrapper bg-gray-50 py-16 md:py-24 px-4 overflow-hidden relative`;
      } else if (elementType === "column") {
        // Apply column styling with Tailwind
        result.settings.css_classes += ` ${clientFirstPrefix}_container bg-white rounded-lg p-6 shadow-sm`;
      } else if (widgetType) {
        // Apply widget-specific Tailwind classes
        switch (widgetType) {
          case "heading":
            result.settings.css_classes += ` ${clientFirstPrefix}_heading text-gray-800 text-2xl md:text-4xl font-semibold`;
            break;
          case "text-editor":
            result.settings.css_classes += ` ${clientFirstPrefix}_text text-gray-500 text-base leading-relaxed`;
            break;
          case "button":
            result.settings.css_classes += ` ${clientFirstPrefix}_btn inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-center rounded-md border border-gray-800 bg-white text-gray-800 hover:bg-gray-800 hover:text-white transition-colors`;
            break;
          case "image":
            result.settings.css_classes += ` ${clientFirstPrefix}_image bg-gray-200 rounded-lg aspect-video object-cover`;
            break;
          case "icon":
            result.settings.css_classes += ` ${clientFirstPrefix}_icon text-gray-800 flex items-center justify-center`;
            break;
          case "icon-box":
            result.settings.css_classes += ` ${clientFirstPrefix}_feature bg-white p-6 rounded-lg shadow-sm`;
            break;
          case "video":
            result.settings.css_classes += ` ${clientFirstPrefix}_video bg-gray-200 rounded-lg aspect-video`;
            break;
          case "testimonial":
            result.settings.css_classes += ` ${clientFirstPrefix}_testimonial bg-gray-50 p-6 rounded-lg`;
            break;
          case "tabs":
            result.settings.css_classes += ` ${clientFirstPrefix}_tabs border-b border-gray-200`;
            break;
          case "accordion":
            result.settings.css_classes += ` ${clientFirstPrefix}_accordion border border-gray-200 rounded-lg`;
            break;
          case "form":
            result.settings.css_classes += ` ${clientFirstPrefix}_form space-y-4 bg-white p-6 rounded-lg shadow-sm`;
            break;
          default:
            result.settings.css_classes += ` ${clientFirstPrefix}_${widgetType.replace(/[-_]/g, '-')} bg-white rounded-lg`;
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

// Determine section context for semantic naming
const determineSectionContext = (element: any): string => {
  // Check if we can infer a section type from content
  if (!element || !element.settings) return "";
  
  const settings = element.settings;
  let title = "";
  
  // Check for heading content to guess context
  if (settings.title) {
    title = settings.title.toLowerCase();
  } else if (element.elements) {
    // Check children for headings
    const headingElement = findHeadingInElements(element.elements);
    if (headingElement && headingElement.settings && headingElement.settings.title) {
      title = headingElement.settings.title.toLowerCase();
    }
  }
  
  // Detect common section types by content
  if (title.includes("hero") || title.includes("banner") || (element.elType === "section" && isFirstSection(element))) {
    return "hero";
  } else if (title.includes("feature") || title.includes("benefit") || title.includes("why")) {
    return "feature";
  } else if (title.includes("testimonial") || title.includes("review") || title.includes("client")) {
    return "testimonial";
  } else if (title.includes("about") || title.includes("us") || title.includes("story")) {
    return "about";
  } else if (title.includes("contact") || title.includes("touch") || title.includes("form")) {
    return "contact";
  } else if (title.includes("blog") || title.includes("news") || title.includes("article")) {
    return "blog";
  } else if (title.includes("team") || title.includes("member") || title.includes("staff")) {
    return "team";
  } else if (title.includes("service") || title.includes("offering")) {
    return "service";
  } else if (title.includes("work") || title.includes("portfolio") || title.includes("project")) {
    return "portfolio";
  } else if (title.includes("faq") || title.includes("question")) {
    return "faq";
  } else if (title.includes("cta") || title.includes("action") || title.includes("start")) {
    return "cta";
  } else if (title.includes("price") || title.includes("plan") || title.includes("package")) {
    return "pricing";
  } else if (title.includes("gallery") || title.includes("image")) {
    return "gallery";
  }
  
  // Default to section if no specific context found
  return "section";
};

// Helper to find heading element in children
const findHeadingInElements = (elements: any[]): any => {
  if (!elements || !Array.isArray(elements)) return null;
  
  for (const element of elements) {
    if (element.widgetType === "heading") {
      return element;
    } else if (element.elements) {
      const found = findHeadingInElements(element.elements);
      if (found) return found;
    }
  }
  
  return null;
};

// Helper to check if a section is likely the first/hero section
const isFirstSection = (element: any): boolean => {
  // This is a simple check assuming the element might be a hero section
  // More complex logic could be added based on position, size, etc.
  return true; // Simplified for now, would need more context to determine accurately
};

// Helper to convert widget type to semantic name
const convertToSemantic = (widgetType: string): string => {
  switch (widgetType) {
    case "heading": return "heading";
    case "text-editor": return "text";
    case "button": return "btn";
    case "image": return "image";
    case "icon": return "icon";
    case "icon-box": return "feature";
    case "video": return "video";
    case "testimonial": return "testimonial";
    case "tabs": return "tabs";
    case "accordion": return "accordion";
    case "form": return "form";
    // Add more mappings as needed
    default: return widgetType.replace(/[-_]/g, '').toLowerCase();
  }
};

// List of properties that affect layout and should be preserved
const layoutProperties = [
  'layout', 'content_width', 'custom_width', 'gap', 'column_gap', 'row_gap',
  '_element_width', '_element_custom_width', 'content_position', 'alignment',
  'space_between_widgets', 'position', 'width', 'height', 'flex_', 'display',
  'content_align', 'justify_content', 'align_items', 'align_content',
  'flex_direction', 'flex_wrap', 'grid_template_columns', 'grid_column_gap',
  'grid_row_gap', 'element_width', 'size_tablet', 'size_mobile', 'flex_grow',
  'columns_gap', 'rows_gap', 'structure', 'responsive_settings', 'container_type',
  'padding', 'margin', '_margin', '_padding', 'spacing'
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

// Premium wireframe style properties to apply when removing custom styles
const premiumWireframeStyles = {
  // Top-level sections
  section: {
    background_color: "#F7F6F3",
    border_radius: { size: 8, unit: 'px' },
    box_shadow_box_shadow_type: "yes",
    box_shadow_box_shadow: {
      horizontal: 0, vertical: 4, blur: 16, spread: 0, 
      color: "rgba(0, 0, 0, 0.05)", position: "outside"
    }
  },
  // Column elements
  column: {
    background_color: "#FFFFFF",
    border_radius: { size: 8, unit: 'px' },
    box_shadow_box_shadow_type: "yes",
    box_shadow_box_shadow: {
      horizontal: 0, vertical: 4, blur: 12, spread: 0, 
      color: "rgba(0, 0, 0, 0.03)", position: "outside"
    },
  },
  // Text elements
  heading: {
    title_color: "#333333",
    typography_typography: "custom",
    typography_font_size: { size: 32, unit: 'px' },
    typography_font_weight: "600",
    typography_line_height: { size: 1.2, unit: 'em' },
  },
  'text-editor': {
    text_color: "#666666",
    typography_typography: "custom",
    typography_font_size: { size: 16, unit: 'px' },
    typography_line_height: { size: 1.6, unit: 'em' },
  },
  // Interactive elements
  button: {
    background_color: "#FFFFFF",
    button_text_color: "#333333",
    border_border: "solid",
    border_width: { top: "1", right: "1", bottom: "1", left: "1", unit: 'px' },
    border_color: "#333333",
    border_radius: { size: 6, unit: 'px' },
    hover_background_color: "#333333",
    hover_color: "#FFFFFF",
    typography_typography: "custom",
    typography_font_size: { size: 14, unit: 'px' },
    typography_font_weight: "500",
  },
  // Media elements
  image: {
    background_color: "#E3E1DC",
    border_radius: { size: 8, unit: 'px' }
  },
  icon: {
    primary_color: "#333333",
    size: { size: 24, unit: 'px' }
  },
  video: {
    background_color: "#E3E1DC",
    border_radius: { size: 8, unit: 'px' },
    aspect_ratio: "169"
  },
  // Cards & Containers
  "icon-box": {
    background_color: "#FFFFFF",
    border_radius: { size: 8, unit: 'px' },
    box_shadow_box_shadow_type: "yes",
    box_shadow_box_shadow: {
      horizontal: 0, vertical: 4, blur: 12, spread: 0, 
      color: "rgba(0, 0, 0, 0.03)", position: "outside"
    }
  },
  testimonial: {
    background_color: "#F7F6F3",
    border_radius: { size: 8, unit: 'px' }
  },
  // Default for any other element type
  default: {
    background_color: "#FFFFFF",
    border_radius: { size: 8, unit: 'px' }
  }
};

// Context-specific wireframe styles
const contextWireframeStyles = {
  hero: {
    background_color: "#F7F6F3",
    padding: { top: "80", right: "20", bottom: "80", left: "20", unit: 'px' }
  },
  feature: {
    background_color: "#FFFFFF",
    padding: { top: "64", right: "20", bottom: "64", left: "20", unit: 'px' }
  },
  cta: {
    background_color: "#333333",
    heading: { title_color: "#FFFFFF" },
    'text-editor': { text_color: "#EEEEEE" },
    button: { 
      background_color: "#FFFFFF", 
      button_text_color: "#333333",
      hover_background_color: "transparent",
      hover_color: "#FFFFFF",
      border_color: "#FFFFFF"
    },
    padding: { top: "64", right: "20", bottom: "64", left: "20", unit: 'px' }
  },
  testimonial: {
    background_color: "#F7F6F3",
    padding: { top: "64", right: "20", bottom: "64", left: "20", unit: 'px' }
  },
  pricing: {
    background_color: "#FFFFFF",
    padding: { top: "80", right: "20", bottom: "80", left: "20", unit: 'px' }
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

// Apply wireframe styles based on widget type and context
const applyWireframeStyles = (settings: any, elType: string, widgetType: string, sectionContext: string = ""): any => {
  const result = { ...settings };
  
  // Apply context-specific styles if available
  if (elType === "section" && sectionContext && contextWireframeStyles[sectionContext]) {
    return { ...result, ...contextWireframeStyles[sectionContext] };
  }
  
  // Determine which default styles to apply
  let defaultStyles;
  
  if (widgetType && premiumWireframeStyles[widgetType]) {
    defaultStyles = premiumWireframeStyles[widgetType];
  } else if (elType && premiumWireframeStyles[elType]) {
    defaultStyles = premiumWireframeStyles[elType];
  } else {
    defaultStyles = premiumWireframeStyles.default;
  }
  
  // Apply the default styles
  return { ...result, ...defaultStyles };
};

// Clean settings object by removing unnecessary properties
const cleanSettings = (settings: any, removeStyles: boolean = false, elType: string = '', widgetType: string = '', sectionContext: string = ''): any => {
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
    return applyWireframeStyles(cleanedSettings, elType, widgetType, sectionContext);
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
