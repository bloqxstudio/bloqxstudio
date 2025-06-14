
/**
 * Utility to convert Elementor HTML to proper JSON format for import
 */

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
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Find the main container
    const mainContainer = doc.querySelector('[data-elementor-type]');
    if (!mainContainer) {
      throw new Error('No Elementor container found');
    }

    // Extract elements recursively
    const elements = extractElementsFromHtml(mainContainer);
    
    // Create the final JSON structure compatible with Elementor
    const elementorJson = {
      type: "elementor",
      siteurl: "https://superelements.io/wp-json/",
      elements: elements
    };

    return JSON.stringify(elementorJson, null, 2);
  } catch (error) {
    console.error('Error converting HTML to Elementor JSON:', error);
    throw error;
  }
};

const extractElementsFromHtml = (element: Element): ElementorElement[] => {
  const elements: ElementorElement[] = [];
  
  // Get direct children that are Elementor elements
  const elementorChildren = Array.from(element.children).filter(child => 
    child.hasAttribute('data-element_type') || child.hasAttribute('data-id')
  );
  
  elementorChildren.forEach((child) => {
    const elementData = extractElementData(child);
    if (elementData) {
      elements.push(elementData);
    }
  });

  return elements;
};

const extractElementData = (element: Element): ElementorElement | null => {
  const id = element.getAttribute('data-id');
  const elementType = element.getAttribute('data-element_type');
  const widgetType = element.getAttribute('data-widget_type');
  
  if (!id || !elementType) {
    return null;
  }

  const elementData: ElementorElement = {
    id,
    elType: elementType === 'container' ? 'container' : 'widget',
    isInner: element.classList.contains('e-child'),
    isLocked: false,
  };

  // Extract settings from data-settings attribute
  const settingsAttr = element.getAttribute('data-settings');
  let extractedSettings = {};
  
  if (settingsAttr) {
    try {
      extractedSettings = JSON.parse(settingsAttr.replace(/&quot;/g, '"'));
    } catch (e) {
      console.warn('Failed to parse settings:', e);
      extractedSettings = {};
    }
  }

  // Set widget type for widgets
  if (widgetType) {
    elementData.widgetType = widgetType.replace('.default', '');
  }

  // Handle container specific logic
  if (elementType === 'container') {
    // Set comprehensive container settings
    elementData.settings = {
      flex_direction: "column",
      container_type: "flex",
      content_width: "boxed",
      width: { unit: "%", size: "", sizes: [] },
      min_height: { unit: "px", size: "", sizes: [] },
      flex_gap: { column: "0", row: "0", isLinked: true, unit: "px", size: 0 },
      padding: { unit: "px", top: "0", right: "0", bottom: "0", left: "0", isLinked: false },
      background_background: "classic",
      ...extractedSettings
    };

    // Extract child elements
    const innerContainer = element.querySelector('.e-con-inner') || element;
    if (innerContainer) {
      elementData.elements = extractElementsFromHtml(innerContainer);
    }
  }

  // Handle widget specific content
  if (elementType === 'widget') {
    elementData.settings = {
      ...extractedSettings,
      ...extractWidgetContent(element, widgetType || ''),
    };
  }

  return elementData;
};

const extractWidgetContent = (element: Element, widgetType: string): Record<string, any> => {
  const settings: Record<string, any> = {};

  switch (widgetType) {
    case 'heading.default':
      const heading = element.querySelector('.elementor-heading-title');
      if (heading) {
        settings.title = heading.textContent || '';
        settings.header_size = heading.tagName.toLowerCase();
        settings.title_color = "";
        settings.typography_typography = "custom";
      }
      break;

    case 'text-editor.default':
      const textContent = element.querySelector('.elementor-widget-container');
      if (textContent) {
        settings.editor = textContent.innerHTML || '';
      }
      break;

    case 'image.default':
      const img = element.querySelector('img');
      if (img) {
        settings.image = {
          url: img.getAttribute('src') || '',
          id: "",
          size: ""
        };
        
        // Extract animation settings if present
        const animationClass = element.classList.toString();
        if (animationClass.includes('elementor-invisible')) {
          settings._animation = "fadeIn";
          settings._animation_delay = 500;
        }
      }
      break;

    default:
      // Generic content extraction
      const content = element.querySelector('.elementor-widget-container');
      if (content) {
        settings.content = content.innerHTML || '';
      }
      break;
  }

  return settings;
};
