
export const cleanElementorJson = (jsonString: string, removeStyles = false): string => {
  try {
    // First, validate the JSON
    if (!validateJson(jsonString)) {
      throw new Error('Invalid JSON format');
    }

    // Parse the JSON
    const jsonObj = JSON.parse(jsonString);

    // Validate that it's an Elementor JSON
    if (!validateElementorJson(jsonObj)) {
      throw new Error('Not a valid Elementor JSON');
    }

    // Apply wireframe transformation if requested
    if (removeStyles) {
      return transformToWireframe(jsonString);
    }

    // Otherwise, apply regular cleaning with or without styles
    const parsed = JSON.parse(jsonString);
    const cleaned = formatElementorJson(parsed, false);
    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Error cleaning JSON:", e);
    return jsonString;
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
    siteurl: "https://example.com/",
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
  
  // Determine element context for user-friendly naming
  const elementType = element.elType || "unknown";
  const widgetType = element.widgetType || "";
  
  // Determine semantic context for naming based on content or structure
  let sectionContext = determineSectionContext(element);
  let componentName = "";
  
  if (elementType === "section") {
    componentName = sectionContext || "secao";
  } else if (elementType === "column") {
    componentName = "coluna";
  } else if (widgetType) {
    // Convert widget type to semantic naming in Portuguese
    componentName = convertToSemanticPortuguese(widgetType);
  }
  
  // Create user-friendly class name
  const sectionPrefix = elementType === "section" ? `${componentName}` : "";
  const friendlyPrefix = sectionPrefix || `${sectionContext || componentName}`;
  
  // Set component title with semantic naming in Portuguese
  if (elementType === "section") {
    result._title = `${friendlyPrefix}_wrapper`;
  } else if (elementType === "column") {
    result._title = `${friendlyPrefix}_container`;
  } else if (widgetType) {
    switch (widgetType) {
      case "heading":
        result._title = `${friendlyPrefix}_titulo`;
        break;
      case "text-editor":
        result._title = `${friendlyPrefix}_texto`;
        break;
      case "button":
        result._title = `${friendlyPrefix}_botao`;
        break;
      case "image":
        result._title = `${friendlyPrefix}_imagem`;
        break;
      case "icon":
        result._title = `${friendlyPrefix}_icone`;
        break;
      case "icon-box":
        result._title = `${friendlyPrefix}_recurso`;
        break;
      case "video":
        result._title = `${friendlyPrefix}_video`;
        break;
      case "testimonial":
        result._title = `${friendlyPrefix}_depoimento`;
        break;
      case "tabs":
        result._title = `${friendlyPrefix}_abas`;
        break;
      case "accordion":
        result._title = `${friendlyPrefix}_accordion`;
        break;
      case "form":
        result._title = `${friendlyPrefix}_formulario`;
        break;
      default:
        result._title = `${friendlyPrefix}_${widgetType.replace(/[-_]/g, '-')}`;
    }
  } else {
    result._title = `${friendlyPrefix}_${elementType}`;
  }
  
  // Clean settings
  if (result.settings && typeof result.settings === 'object') {
    result.settings = cleanSettings(result.settings, removeStyles, elementType, widgetType, sectionContext);
    
    // Add tailwind classes when applying wireframe style (removing original styles)
    if (removeStyles && result.settings) {
      // Apply friendly class naming convention with Tailwind CSS classes
      if (!result.settings.css_classes) {
        result.settings.css_classes = '';
      }
      
      // Add appropriate Tailwind classes based on element type
      if (elementType === "section") {
        // Apply section styling with Tailwind
        result.settings.css_classes += ` ${friendlyPrefix}_wrapper bg-gray-50 py-16 md:py-24 px-4 overflow-hidden relative`;
      } else if (elementType === "column") {
        // Apply column styling with Tailwind
        result.settings.css_classes += ` ${friendlyPrefix}_container bg-white rounded-lg p-6 shadow-sm`;
      } else if (widgetType) {
        // Apply widget-specific Tailwind classes
        switch (widgetType) {
          case "heading":
            result.settings.css_classes += ` ${friendlyPrefix}_titulo text-gray-800 text-2xl md:text-4xl font-semibold`;
            break;
          case "text-editor":
            result.settings.css_classes += ` ${friendlyPrefix}_texto text-gray-500 text-base leading-relaxed`;
            break;
          case "button":
            result.settings.css_classes += ` ${friendlyPrefix}_botao inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-center rounded-md border border-gray-800 bg-black text-white hover:bg-gray-800 hover:text-white transition-colors`;
            break;
          case "image":
            result.settings.css_classes += ` ${friendlyPrefix}_imagem bg-gray-200 rounded-lg aspect-video object-cover`;
            break;
          case "icon":
            result.settings.css_classes += ` ${friendlyPrefix}_icone text-gray-800 flex items-center justify-center`;
            break;
          case "icon-box":
            result.settings.css_classes += ` ${friendlyPrefix}_recurso bg-white p-6 rounded-lg shadow-sm`;
            break;
          case "video":
            result.settings.css_classes += ` ${friendlyPrefix}_video bg-gray-200 rounded-lg aspect-video`;
            break;
          case "testimonial":
            result.settings.css_classes += ` ${friendlyPrefix}_depoimento bg-gray-50 p-6 rounded-lg`;
            break;
          case "tabs":
            result.settings.css_classes += ` ${friendlyPrefix}_abas border-b border-gray-200`;
            break;
          case "accordion":
            result.settings.css_classes += ` ${friendlyPrefix}_accordion border border-gray-200 rounded-lg`;
            break;
          case "form":
            result.settings.css_classes += ` ${friendlyPrefix}_formulario space-y-4 bg-white p-6 rounded-lg shadow-sm`;
            break;
          default:
            result.settings.css_classes += ` ${friendlyPrefix}_${widgetType.replace(/[-_]/g, '-')} bg-white rounded-lg`;
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
  
  // Detect common section types by content (in Portuguese)
  if (title.includes("hero") || title.includes("banner") || title.includes("principal") || (element.elType === "section" && isFirstSection(element))) {
    return "hero";
  } else if (title.includes("feature") || title.includes("recurso") || title.includes("beneficio") || title.includes("vantagem")) {
    return "recurso";
  } else if (title.includes("testimonial") || title.includes("depoimento") || title.includes("cliente") || title.includes("feedback")) {
    return "depoimento";
  } else if (title.includes("about") || title.includes("sobre") || title.includes("empresa") || title.includes("historia")) {
    return "sobre";
  } else if (title.includes("contact") || title.includes("contato") || title.includes("contate") || title.includes("formulario")) {
    return "contato";
  } else if (title.includes("blog") || title.includes("noticias") || title.includes("artigos")) {
    return "blog";
  } else if (title.includes("team") || title.includes("equipe") || title.includes("pessoas") || title.includes("time")) {
    return "equipe";
  } else if (title.includes("service") || title.includes("servico") || title.includes("solucao")) {
    return "servico";
  } else if (title.includes("work") || title.includes("portfolio") || title.includes("projeto") || title.includes("trabalho")) {
    return "portfolio";
  } else if (title.includes("faq") || title.includes("pergunta") || title.includes("duvida")) {
    return "faq";
  } else if (title.includes("cta") || title.includes("acao") || title.includes("comece")) {
    return "cta";
  } else if (title.includes("price") || title.includes("preco") || title.includes("plano") || title.includes("pacote")) {
    return "preco";
  } else if (title.includes("gallery") || title.includes("galeria") || title.includes("imagem")) {
    return "galeria";
  }
  
  // Default to section if no specific context found
  return "secao";
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
  return true; // Simplified for now, would need more context to determine accurately
};

// Helper to convert widget type to semantic name in Portuguese
const convertToSemanticPortuguese = (widgetType: string): string => {
  switch (widgetType) {
    case "heading": return "titulo";
    case "text-editor": return "texto";
    case "button": return "botao";
    case "image": return "imagem";
    case "icon": return "icone";
    case "icon-box": return "recurso";
    case "video": return "video";
    case "testimonial": return "depoimento";
    case "tabs": return "abas";
    case "accordion": return "accordion";
    case "form": return "formulario";
    case "progress": return "progresso";
    case "counter": return "contador";
    case "spacer": return "espaco";
    case "divider": return "divisor";
    case "google_maps": return "mapa";
    case "carousel": return "carrossel";
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
const wireframeStyles = {
  // Top-level sections
  section: {
    background_color: "#F7F7F7",
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
    title: "Título Aqui"
  },
  'text-editor': {
    text_color: "#666666",
    typography_typography: "custom",
    typography_font_size: { size: 16, unit: 'px' },
    typography_line_height: { size: 1.6, unit: 'em' },
    editor: "Texto descritivo genérico. Este é um texto de exemplo que serve como placeholder para o conteúdo real."
  },
  // Interactive elements
  button: {
    background_color: "#333333",
    button_text_color: "#FFFFFF",
    border_border: "solid",
    border_width: { top: "1", right: "1", bottom: "1", left: "1", unit: 'px' },
    border_color: "#333333",
    border_radius: { size: 6, unit: 'px' },
    hover_background_color: "#555555",
    hover_color: "#FFFFFF",
    typography_typography: "custom",
    typography_font_size: { size: 14, unit: 'px' },
    typography_font_weight: "500",
    text: "Botão Principal"
  },
  // Media elements
  image: {
    background_color: "#E5E5E5",
    border_radius: { size: 8, unit: 'px' },
    alt: "Imagem Genérica",
    image: {
      url: "https://bloqxstudio.com/wp-content/uploads/2025/03/placeholder.jpg",
      id: 0
    }
  },
  icon: {
    primary_color: "#333333",
    size: { size: 24, unit: 'px' }
  },
  video: {
    background_color: "#E5E5E5",
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
    },
    title_text: "Item da Lista",
    description_text: "Descrição do item. Este é um texto genérico usado como placeholder."
  },
  testimonial: {
    background_color: "#F7F7F7",
    border_radius: { size: 8, unit: 'px' },
    testimonial_content: "Este é um texto de depoimento genérico. Ele serve como placeholder para um conteúdo real.",
    name: "Título do Depoimento",
    job: "Subtítulo do Depoimento",
    image: {
      url: "https://bloqxstudio.com/wp-content/uploads/2025/03/placeholder.jpg",
      id: 0
    }
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
    background_color: "#F7F7F7",
    padding: { top: "80", right: "20", bottom: "80", left: "20", unit: 'px' }
  },
  recurso: {
    background_color: "#FFFFFF",
    padding: { top: "64", right: "20", bottom: "64", left: "20", unit: 'px' }
  },
  cta: {
    background_color: "#333333",
    heading: { 
      title_color: "#FFFFFF",
      title: "Título de Chamada para Ação"
    },
    'text-editor': { 
      text_color: "#EEEEEE",
      editor: "Este é um texto de chamada para ação. Incentive o usuário a realizar uma ação específica."
    },
    button: { 
      background_color: "#FFFFFF", 
      button_text_color: "#333333",
      hover_background_color: "transparent",
      hover_color: "#FFFFFF",
      border_color: "#FFFFFF",
      text: "Botão de Ação"
    },
    padding: { top: "64", right: "20", bottom: "64", left: "20", unit: 'px' }
  },
  depoimento: {
    background_color: "#F7F7F7",
    padding: { top: "64", right: "20", bottom: "64", left: "20", unit: 'px' }
  },
  preco: {
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
  
  if (widgetType && wireframeStyles[widgetType]) {
    defaultStyles = wireframeStyles[widgetType];
  } else if (elType && wireframeStyles[elType]) {
    defaultStyles = wireframeStyles[elType];
  } else {
    defaultStyles = wireframeStyles.default;
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

/**
 * Transforms Elementor JSON content into a high-fidelity wireframe version
 * - Preserves layout structure and hierarchy
 * - Replaces content with Brazilian Portuguese placeholders
 * - Applies grayscale aesthetic using Tailwind classes
 * - Renames elements using friendly, user-readable names
 */
export const transformToWireframe = (jsonContent: string): string => {
  try {
    // Parse the JSON content
    const parsedJson = JSON.parse(jsonContent);
    
    // Apply wireframe transformation recursively to all elements
    if (parsedJson.elements && Array.isArray(parsedJson.elements)) {
      transformElementsToWireframe(parsedJson.elements);
    }
    
    // Return the transformed JSON as a formatted string
    return JSON.stringify(parsedJson, null, 2);
  } catch (error) {
    console.error('Error transforming to wireframe:', error);
    return jsonContent;
  }
};

const transformElementsToWireframe = (elements: any[], parentType = '', depth = 0, sectionIndex = 0) => {
  elements.forEach((element, index) => {
    // Determine component type based on element attributes or position
    let componentType = '';
    if (depth === 0) {
      // Set component type based on position or content
      componentType = determineSectionContext(element) || `secao${sectionIndex + 1}`;
      sectionIndex++;
    } else {
      componentType = parentType;
    }
    
    // Generate semantic name based on element type and component context
    const elementType = element.elType || '';
    const widgetType = element.widgetType || '';
    
    // Apply wireframe styling based on element type
    applyWireframeStyling(element, elementType, widgetType, componentType);
    
    // Rename the element using friendly naming
    renameElement(element, elementType, widgetType, componentType, index);
    
    // Replace content with Brazilian Portuguese placeholders
    replaceContentWithPortugueseText(element, widgetType);
    
    // Process child elements recursively if they exist
    if (element.elements && Array.isArray(element.elements)) {
      transformElementsToWireframe(
        element.elements, 
        componentType, 
        depth + 1, 
        sectionIndex
      );
    }
  });
};

const applyWireframeStyling = (element: any, elementType: string, widgetType: string, componentType: string) => {
  // Base styling for all elements
  if (!element.settings) {
    element.settings = {};
  }
  
  // Remove backgrounds, borders and custom colors
  delete element.settings.background_color;
  delete element.settings.background_image;
  delete element.settings.background_overlay;
  delete element.settings.background_overlay_color;
  delete element.settings.background_overlay_image;
  
  // Preserve layout properties
  // (We don't touch margin, padding, width, height, alignment)
  
  // Apply wireframe styling based on element type
  switch (elementType) {
    case 'section':
      element.settings._background_color = '#F7F7F7';
      element.settings._css_classes = `${componentType}_wrapper bg-gray-100 rounded-lg p-8 md:p-12 shadow-sm`;
      break;
      
    case 'column':
      element.settings._css_classes = `${componentType}_container`;
      break;
      
    case 'widget':
      applyWidgetWireframeStyles(element, widgetType, componentType);
      break;
  }
};

const applyWidgetWireframeStyles = (element: any, widgetType: string, componentType: string) => {
  if (!element.settings) {
    element.settings = {};
  }

  switch (widgetType) {
    case 'heading':
      element.settings.title_color = '#333333';
      element.settings._css_classes = `${componentType}_titulo text-gray-800 font-semibold`;
      if (!element.settings.title || element.settings.title.includes('Lorem ipsum') || element.settings.title.includes('Curso') || element.settings.title.includes('Doces')) {
        element.settings.title = "Título Aqui";
      }
      break;
      
    case 'text-editor':
      element.settings.text_color = '#666666';
      element.settings._css_classes = `${componentType}_texto text-gray-600`;
      element.settings.editor = "Texto de descrição aqui. Este é um texto genérico que serve como placeholder para o conteúdo real que será exibido neste componente.";
      break;
      
    case 'button':
      element.settings.button_text_color = '#FFFFFF';
      element.settings.background_color = '#000000';
      element.settings.hover_color = '#FFFFFF';
      element.settings.hover_background_color = '#333333';
      element.settings.border_radius = { size: 4, unit: 'px' };
      element.settings._css_classes = `${componentType}_botao bg-black text-white rounded`;
      element.settings.text = "Botão Principal";
      break;
      
    case 'image':
      // Replace with generic placeholder image
      if (element.settings.image) {
        element.settings.image = {
          url: "https://bloqxstudio.com/wp-content/uploads/2025/03/placeholder.jpg",
          id: 0
        };
      }
      element.settings._css_classes = `${componentType}_imagem bg-gray-200`;
      element.settings.alt = "Imagem Genérica";
      break;
      
    case 'icon':
      element.settings.primary_color = '#333333';
      element.settings._css_classes = `${componentType}_icone text-gray-800`;
      break;
      
    case 'icon-box':
      element.settings._css_classes = `${componentType}_recurso bg-white p-6 rounded-lg shadow-sm`;
      element.settings.title_text = "Item da Lista";
      element.settings.description_text = "Descrição do item. Este é um texto genérico usado como placeholder.";
      break;
      
    case 'testimonial':
      element.settings._css_classes = `${componentType}_depoimento bg-gray-50 p-6 rounded-lg`;
      element.settings.testimonial_content = "Este é um texto de depoimento genérico. Ele serve como placeholder para uma citação real.";
      element.settings.name = "Nome da Pessoa";
      element.settings.job = "Cargo, Empresa";
      // Replace testimonial image with placeholder
      if (element.settings.image) {
        element.settings.image = {
          url: "https://bloqxstudio.com/wp-content/uploads/2025/03/placeholder.jpg",
          id: 0
        };
      }
      break;
      
    case 'price-list':
    case 'price-table':
      // Replace any price-specific texts with generic placeholders
      if (element.settings.heading_title) {
        element.settings.heading_title = "Título do Plano";
      }
      if (element.settings.heading_description) {
        element.settings.heading_description = "Descrição do plano";
      }
      if (element.settings.price_currency_symbol) {
        element.settings.price_currency_symbol = "R$";
      }
      if (element.settings.price) {
        element.settings.price = "99";
      }
      if (element.settings.period) {
        element.settings.period = "/mês";
      }
      break;
  }
};

const renameElement = (element: any, elementType: string, widgetType: string, componentType: string, index: number) => {
  if (!element.settings) {
    element.settings = {};
  }
  
  // Generate user-friendly ID based on component type and element type
  const friendlyId = generateFriendlyId(elementType, widgetType, componentType, index);
  
  // Apply new title to element
  element._title = friendlyId;
  
  // If element already has CSS classes, add them to our new classes
  let existingClasses = element.settings._css_classes || '';
  if (existingClasses && !element.settings._css_classes.includes(componentType)) {
    element.settings._css_classes = `${friendlyId} ${existingClasses}`;
  } else if (!element.settings._css_classes) {
    element.settings._css_classes = friendlyId;
  }
};

const generateFriendlyId = (elementType: string, widgetType: string, componentType: string, index: number): string => {
  switch (elementType) {
    case 'section':
      return `${componentType}_wrapper`;
      
    case 'column':
      return `${componentType}_container`;
      
    case 'widget':
      switch (widgetType) {
        case 'heading':
          return `${componentType}_titulo`;
          
        case 'text-editor':
          return `${componentType}_texto`;
          
        case 'button':
          return `${componentType}_botao`;
          
        case 'image':
          return `${componentType}_imagem`;
          
        case 'icon':
          return `${componentType}_icone`;
          
        case 'icon-box':
          return `${componentType}_recurso`;
          
        case 'video':
          return `${componentType}_video`;
          
        case 'testimonial':
          return `${componentType}_depoimento`;
          
        case 'tabs':
          return `${componentType}_abas`;
          
        case 'accordion':
          return `${componentType}_accordion`;
          
        case 'form':
          return `${componentType}_formulario`;
          
        default:
          return `${componentType}_${convertToSemanticPortuguese(widgetType)}`;
      }
      
    default:
      return `${componentType}_elemento`;
  }
};

const replaceContentWithPortugueseText = (element: any, widgetType: string) => {
  if (!element.settings) return;
  
  switch (widgetType) {
    case 'heading':
      if (!element.settings.title || 
          element.settings.title.toLowerCase().includes('lorem ipsum') ||
          element.settings.title.includes('Curso') ||
          element.settings.title.includes('completo') ||
          element.settings.title.includes('Doce') ||
          element.settings.title.includes('Finos') ||
          element.settings.title.includes('superbônus')
         ) {
        // Check if heading might be multi-line based on length or original content
        if (element.settings.title && element.settings.title.length > 25) {
          element.settings.title = 'Título em Duas Linhas Para Destaque';
        } else {
          element.settings.title = 'Título Aqui';
        }
      }
      break;
      
    case 'text-editor':
      // Check for client-specific content
      if (element.settings.editor && (
          element.settings.editor.includes('receita') ||
          element.settings.editor.includes('técnica') ||
          element.settings.editor.includes('estratégia') ||
          element.settings.editor.includes('negócio') ||
          element.settings.editor.includes('curso') ||
          element.settings.editor.includes('doce')
      )) {
        element.settings.editor = 'Texto descritivo genérico. Este é um texto de exemplo que serve como placeholder para o conteúdo real.';
      }
      break;
      
    case 'button':
      // Replace button text that might be client-specific
      if (element.settings.text && (
          element.settings.text.includes('TOQUE') ||
          element.settings.text.includes('APREND') ||
          element.settings.text.includes('LUCR')
      )) {
        element.settings.text = 'Botão Principal';
      }
      break;
      
    case 'price-table':
    case 'price-list':
      // Replace any price with generic value
      if (element.settings.price) {
        element.settings.price = '99';
      }
      if (element.settings.sale_price) {
        element.settings.sale_price = '89';
      }
      if (element.settings.period && (element.settings.period.includes('12x') || element.settings.period.includes('vista'))) {
        element.settings.period = '/mês';
      }
      break;
      
    case 'image':
      // Always replace image with placeholder
      if (element.settings.image) {
        element.settings.image = {
          url: "https://bloqxstudio.com/wp-content/uploads/2025/03/placeholder.jpg",
          id: 0
        };
      }
      if (element.settings.alt) {
        element.settings.alt = 'Imagem Genérica';
      }
      break;
      
    case 'icon-box':
      element.settings.title_text = 'Item da Lista';
      element.settings.description_text = 'Descrição do item. Este é um texto genérico usado como placeholder.';
      break;
      
    case 'testimonial':
      element.settings.testimonial_content = 'Este é um texto de depoimento genérico. Ele serve como placeholder para um conteúdo real.';
      element.settings.name = 'Título do Depoimento';
      element.settings.job = 'Subtítulo do Depoimento';
      // Always replace image with placeholder
      if (element.settings.image) {
        element.settings.image = {
          url: "https://bloqxstudio.com/wp-content/uploads/2025/03/placeholder.jpg",
          id: 0
        };
      }
      break;
      
    case 'tabs':
      if (element.settings.tabs) {
        element.settings.tabs = element.settings.tabs.map((tab: any, index: number) => ({
          ...tab,
          tab_title: `Aba ${index + 1}`,
          tab_content: 'Conteúdo da aba. Este é um texto genérico usado como placeholder.'
        }));
      }
      break;
      
    case 'accordion':
      if (element.settings.tabs) {
        element.settings.tabs = element.settings.tabs.map((tab: any, index: number) => ({
          ...tab,
          tab_title: `Item ${index + 1}`,
          tab_content: 'Conteúdo do item. Este é um texto genérico usado como placeholder.'
        }));
      }
      break;
  }
};

