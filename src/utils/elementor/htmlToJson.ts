
/**
 * Enhanced utility to convert Elementor HTML to proper JSON format with complete style preservation
 */

import { extractCompleteStyles, mergeStylesIntoJson } from './styleExtractor';
import { cleanElementorJsonWithStyles } from '../json/preserveStyles';

export interface ElementorElement {
  id: string;
  elType: string;
  isInner?: boolean;
  isLocked?: boolean;
  settings?: Record<string, any>;
  elements?: ElementorElement[];
  widgetType?: string;
}

export const convertHtmlToElementorJson = (htmlContent: string, title: string = ''): string => {
  try {
    console.log('🎨 Iniciando conversão HTML → JSON com preservação de estilos');
    
    // First, extract all styles from the HTML
    const extractedStyles = extractCompleteStyles(htmlContent);
    console.log('📊 Estilos extraídos:', {
      colors: Object.keys(extractedStyles.colors).length,
      typography: Object.keys(extractedStyles.typography).length,
      spacing: Object.keys(extractedStyles.spacing).length,
      responsive: Object.keys(extractedStyles.responsive).length,
      animations: Object.keys(extractedStyles.animations).length
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Find the main container
    const mainContainer = doc.querySelector('[data-elementor-type]') || 
                         doc.querySelector('.elementor-element') ||
                         doc.body.firstElementChild;
    
    if (!mainContainer) {
      throw new Error('No Elementor container found');
    }

    // Extract elements recursively with enhanced style preservation
    const elements = extractElementsFromHtmlWithStyles(mainContainer, extractedStyles);
    
    // Create the final JSON structure compatible with Elementor
    const elementorJson = {
      type: "elementor",
      siteurl: "https://superelements.io/",
      elements: elements,
      globals: extractedStyles.responsive || {}
    };

    let jsonString = JSON.stringify(elementorJson, null, 2);
    
    // Apply style merging and cleaning with preservation
    jsonString = mergeStylesIntoJson(jsonString, extractedStyles);
    jsonString = cleanElementorJsonWithStyles(jsonString, htmlContent, false, true, true);

    console.log('✅ Conversão completa com estilos preservados');
    return jsonString;
  } catch (error) {
    console.error('❌ Erro na conversão HTML → JSON:', error);
    throw error;
  }
};

const extractElementsFromHtmlWithStyles = (element: Element, globalStyles: any): ElementorElement[] => {
  const elements: ElementorElement[] = [];
  
  // Get direct children that are Elementor elements or potential containers
  const elementorChildren = Array.from(element.children).filter(child => 
    child.hasAttribute('data-element_type') || 
    child.hasAttribute('data-id') ||
    child.classList.contains('elementor-element') ||
    child.classList.contains('e-con') ||
    child.classList.contains('elementor-widget')
  );
  
  // If no specific Elementor children found, process all children
  if (elementorChildren.length === 0) {
    elementorChildren.push(...Array.from(element.children));
  }
  
  elementorChildren.forEach((child) => {
    const elementData = extractElementDataWithStyles(child, globalStyles);
    if (elementData) {
      elements.push(elementData);
    }
  });

  return elements;
};

const extractElementDataWithStyles = (element: Element, globalStyles: any): ElementorElement | null => {
  const id = element.getAttribute('data-id') || generateElementId();
  const elementType = element.getAttribute('data-element_type') || detectElementType(element);
  const widgetType = element.getAttribute('data-widget_type') || detectWidgetType(element);
  
  console.log(`🔍 Processando elemento: ${elementType} (${widgetType || 'container'})`);

  const elementData: ElementorElement = {
    id,
    elType: elementType === 'container' || elementType === 'section' ? 'container' : 'widget',
    isInner: element.classList.contains('e-child') || element.classList.contains('elementor-inner'),
    isLocked: false,
  };

  // Extract comprehensive settings from multiple sources
  let extractedSettings = extractComprehensiveSettings(element, globalStyles);

  // Set widget type for widgets
  if (widgetType) {
    elementData.widgetType = widgetType.replace('.default', '');
  }

  // Handle container specific logic with enhanced styling
  if (elementData.elType === 'container') {
    elementData.settings = {
      ...getEnhancedContainerSettings(element, extractedSettings),
      ...extractedSettings
    };

    // Extract child elements
    const innerContainer = element.querySelector('.e-con-inner') || 
                          element.querySelector('.elementor-container') || 
                          element;
    if (innerContainer) {
      elementData.elements = extractElementsFromHtmlWithStyles(innerContainer, globalStyles);
    }
  }

  // Handle widget specific content with enhanced style extraction
  if (elementData.elType === 'widget') {
    const widgetSettings = extractEnhancedWidgetContent(element, widgetType || '', extractedSettings);
    elementData.settings = {
      ...extractedSettings,
      ...widgetSettings,
    };
  }

  return elementData;
};

const extractComprehensiveSettings = (element: Element, globalStyles: any): Record<string, any> => {
  const settings: Record<string, any> = {};

  // 1. Extract from data-settings attribute
  const settingsAttr = element.getAttribute('data-settings');
  if (settingsAttr) {
    try {
      const parsedSettings = JSON.parse(settingsAttr.replace(/&quot;/g, '"'));
      Object.assign(settings, parsedSettings);
    } catch (e) {
      console.warn('⚠️ Erro ao parsear data-settings:', e);
    }
  }

  // 2. Extract from inline styles
  const inlineStyles = element.getAttribute('style');
  if (inlineStyles) {
    const cssProperties = parseCSSStyle(inlineStyles);
    Object.assign(settings, convertCSSToElementorSettings(cssProperties));
  }

  // 3. Extract from CSS classes
  const classSettings = extractSettingsFromClasses(element);
  Object.assign(settings, classSettings);

  // 4. Extract background and color information
  const computedStyle = getComputedStyleSafe(element);
  if (computedStyle) {
    const styleSettings = extractSettingsFromComputedStyle(computedStyle);
    Object.assign(settings, styleSettings);
  }

  // 5. Merge with global styles
  Object.assign(settings, globalStyles.colors);
  Object.assign(settings, globalStyles.typography);
  Object.assign(settings, globalStyles.spacing);

  return settings;
};

const getEnhancedContainerSettings = (element: Element, baseSettings: Record<string, any>): Record<string, any> => {
  const settings: Record<string, any> = {
    flex_direction: "column",
    container_type: "flex",
    content_width: "boxed",
    width: { unit: "%", size: "100", sizes: [] },
    min_height: { unit: "px", size: "", sizes: [] },
    flex_gap: { column: "0", row: "0", isLinked: true, unit: "px", size: 0 },
    padding: { unit: "px", top: "0", right: "0", bottom: "0", left: "0", isLinked: false },
    background_background: "classic",
  };

  // Detect flex direction from CSS
  const computedStyle = getComputedStyleSafe(element);
  if (computedStyle) {
    if (computedStyle.flexDirection === 'row') {
      settings.flex_direction = "row";
    }
    
    // Extract background
    if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      settings.background_color = rgbToHex(computedStyle.backgroundColor);
    }
    
    // Extract padding
    if (computedStyle.padding && computedStyle.padding !== '0px') {
      settings.padding = parsePaddingValue(computedStyle.padding);
    }
  }

  return settings;
};

const extractEnhancedWidgetContent = (element: Element, widgetType: string, baseSettings: Record<string, any>): Record<string, any> => {
  const settings: Record<string, any> = {};

  switch (widgetType) {
    case 'heading.default':
    case 'heading':
      const heading = element.querySelector('.elementor-heading-title') || element.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        settings.title = heading.textContent?.trim() || '';
        settings.header_size = heading.tagName.toLowerCase();
        
        // Extract color and typography
        const computedStyle = getComputedStyleSafe(heading);
        if (computedStyle) {
          if (computedStyle.color) settings.title_color = rgbToHex(computedStyle.color);
          if (computedStyle.fontSize) settings.typography_font_size = { unit: 'px', size: parseInt(computedStyle.fontSize) };
          if (computedStyle.fontWeight) settings.typography_font_weight = computedStyle.fontWeight;
          if (computedStyle.textAlign) settings.align = computedStyle.textAlign;
        }
        
        settings.typography_typography = "custom";
      }
      break;

    case 'text-editor.default':
    case 'text-editor':
      const textContent = element.querySelector('.elementor-widget-container') || element;
      if (textContent) {
        settings.editor = textContent.innerHTML || '';
        
        // Extract text color
        const computedStyle = getComputedStyleSafe(textContent);
        if (computedStyle?.color) {
          settings.text_color = rgbToHex(computedStyle.color);
        }
      }
      break;

    case 'image.default':
    case 'image':
      const img = element.querySelector('img');
      if (img) {
        settings.image = {
          url: img.getAttribute('src') || '',
          id: "",
          size: ""
        };
        
        if (img.alt) settings.image.alt = img.alt;
        
        // Extract animation settings
        if (element.classList.contains('elementor-invisible')) {
          settings._animation = "fadeIn";
          settings._animation_delay = 500;
        }
      }
      break;

    case 'button.default':
    case 'button':
      const button = element.querySelector('a, button') || element;
      if (button) {
        settings.text = button.textContent?.trim() || 'Button';
        
        const computedStyle = getComputedStyleSafe(button);
        if (computedStyle) {
          if (computedStyle.backgroundColor) settings.button_background_color = rgbToHex(computedStyle.backgroundColor);
          if (computedStyle.color) settings.button_text_color = rgbToHex(computedStyle.color);
          if (computedStyle.borderRadius) settings.border_radius = { unit: 'px', size: parseInt(computedStyle.borderRadius) };
          if (computedStyle.padding) settings.button_padding = parsePaddingValue(computedStyle.padding);
        }
        
        if (button.getAttribute('href')) {
          settings.link = { url: button.getAttribute('href') };
        }
      }
      break;

    default:
      // Generic content extraction
      const content = element.querySelector('.elementor-widget-container') || element;
      if (content) {
        settings.content = content.innerHTML || '';
        
        // Extract general styling
        const computedStyle = getComputedStyleSafe(content);
        if (computedStyle) {
          if (computedStyle.color) settings.color = rgbToHex(computedStyle.color);
          if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            settings.background_color = rgbToHex(computedStyle.backgroundColor);
          }
        }
      }
      break;
  }

  return settings;
};

// Helper functions
const generateElementId = (): string => {
  return Math.random().toString(36).substr(2, 7);
};

const detectElementType = (element: Element): string => {
  if (element.classList.contains('e-con') || element.classList.contains('elementor-section')) {
    return 'container';
  }
  if (element.classList.contains('elementor-widget')) {
    return 'widget';
  }
  return 'container';
};

const detectWidgetType = (element: Element): string | null => {
  const classList = Array.from(element.classList);
  
  for (const className of classList) {
    if (className.startsWith('elementor-widget-')) {
      return className.replace('elementor-widget-', '') + '.default';
    }
  }
  
  // Detect by content
  if (element.querySelector('h1, h2, h3, h4, h5, h6')) return 'heading.default';
  if (element.querySelector('img')) return 'image.default';
  if (element.querySelector('a, button')) return 'button.default';
  if (element.querySelector('p, div')) return 'text-editor.default';
  
  return null;
};

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

const convertCSSToElementorSettings = (cssProperties: Record<string, string>): Record<string, any> => {
  const settings: Record<string, any> = {};
  
  Object.entries(cssProperties).forEach(([prop, value]) => {
    switch (prop) {
      case 'background-color':
        settings.background_color = value;
        break;
      case 'color':
        settings.color = value;
        break;
      case 'padding':
        settings.padding = parsePaddingValue(value);
        break;
      case 'margin':
        settings.margin = parsePaddingValue(value);
        break;
      case 'font-size':
        settings.typography_font_size = { unit: 'px', size: parseInt(value) };
        break;
      case 'font-weight':
        settings.typography_font_weight = value;
        break;
      case 'text-align':
        settings.align = value;
        break;
      case 'border-radius':
        settings.border_radius = { unit: 'px', size: parseInt(value) };
        break;
    }
  });
  
  return settings;
};

const extractSettingsFromClasses = (element: Element): Record<string, any> => {
  const settings: Record<string, any> = {};
  const classList = Array.from(element.classList);
  
  // Extract alignment classes
  if (classList.includes('elementor-align-center')) settings.align = 'center';
  if (classList.includes('elementor-align-left')) settings.align = 'left';
  if (classList.includes('elementor-align-right')) settings.align = 'right';
  
  // Extract animation classes
  if (classList.includes('elementor-invisible')) {
    settings._animation = 'fadeIn';
  }
  
  return settings;
};

const getComputedStyleSafe = (element: Element): CSSStyleDeclaration | null => {
  try {
    return window.getComputedStyle(element);
  } catch (e) {
    return null;
  }
};

const extractSettingsFromComputedStyle = (computedStyle: CSSStyleDeclaration): Record<string, any> => {
  const settings: Record<string, any> = {};
  
  if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
    settings.background_color = rgbToHex(computedStyle.backgroundColor);
  }
  
  if (computedStyle.color) {
    settings.color = rgbToHex(computedStyle.color);
  }
  
  return settings;
};

const rgbToHex = (rgb: string): string => {
  if (rgb.startsWith('#')) return rgb;
  
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return rgb;
  
  const [r, g, b] = result.map(num => parseInt(num));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const parsePaddingValue = (value: string): any => {
  const values = value.split(' ').map(v => parseInt(v) || 0);
  
  if (values.length === 1) {
    return { unit: 'px', top: values[0], right: values[0], bottom: values[0], left: values[0], isLinked: true };
  } else if (values.length === 4) {
    return { unit: 'px', top: values[0], right: values[1], bottom: values[2], left: values[3], isLinked: false };
  }
  
  return { unit: 'px', top: 0, right: 0, bottom: 0, left: 0, isLinked: true };
};
