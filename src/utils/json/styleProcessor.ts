/**
 * Style processing utilities for removing and cleaning styles
 */

// Function to recursively remove style properties
export const removeStyleProperties = (elements: any[]): any[] => {
  if (!elements || !Array.isArray(elements)) return [];
  
  return elements.map(element => {
    // Clone the element
    const newElement = { ...element };
    
    // Process settings
    if (newElement.settings && typeof newElement.settings === 'object') {
      // Keep only essential properties and remove styles
      const cleanSettings: any = {};
      
      // List of properties to keep
      const essentialProps = [
        'content_width', 'structure', '_title', 'html_tag',
        'title', 'editor', 'text', 'link', 'url', 'selected_icon',
        'css_classes', 'image', 'form_fields', 'form_name', 'email_to',
        'button_text'
      ];
      
      // Layout properties to preserve
      const layoutProps = [
        'width', 'height', '_element_width', '_element_custom_width', 
        'content_position', 'flex_', 'gap', 'padding', 'margin',
        '_margin', '_padding', 'size', 'flex_direction', 'flex_wrap',
        'space', 'align', 'object-fit'
      ];
      
      // Color properties to always preserve
      const colorProps = [
        'color', 'background_color', 'button_background_color', 
        'title_color', 'button_text_color', 'heading_color',
        'text_color', 'border_color'
      ];
      
      // Copy only essential properties
      Object.keys(newElement.settings).forEach(key => {
        const isEssential = essentialProps.some(prop => key.includes(prop));
        const isLayout = layoutProps.some(prop => key.includes(prop));
        const isColor = colorProps.some(prop => key.includes(prop));
        
        // Remove properties starting with '__globals__' and certain prefixes
        const isGlobal = key.startsWith('__globals__');
        const isUnwanted = ['_motion_fx', 'animation', 'motion_fx', 'background_overlay', 'custom_css'].some(
          prefix => key.includes(prefix)
        );
        
        if ((isEssential || isLayout || isColor) && !isGlobal && !isUnwanted) {
          cleanSettings[key] = newElement.settings[key];
        }
      });
      
      newElement.settings = cleanSettings;
    }
    
    // Process child elements recursively
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = removeStyleProperties(newElement.elements);
    }
    
    return newElement;
  });
};
