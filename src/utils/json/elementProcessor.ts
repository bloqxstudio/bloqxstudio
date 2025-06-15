/**
 * Element processing utilities for Elementor components
 */

// Generate unique ID for Elementor elements
const generateElementorId = (): string => {
  return Math.random().toString(36).substr(2, 7);
};

// Function to transform all elType to "container" with complete configurations
export const transformElementsToContainer = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];
  
  return elements.map(element => {
    // Clone element to avoid modifying the original
    const newElement = { 
      ...element,
      id: element.id || generateElementorId()
    };
    
    // If element is a section or column, transform to container
    if (newElement.elType === "section" || newElement.elType === "column") {
      newElement.elType = "container";
      
      // Apply complete container configurations
      if (newElement.settings) {
        const settings = { ...newElement.settings };
        
        // Essential container configurations
        settings.content_width = settings.content_width || "boxed";
        settings.flex_direction = settings.flex_direction || "column";
        settings.flex_wrap = settings.flex_wrap || "nowrap";
        settings.container_type = settings.container_type || "flex";
        settings.content_position = settings.content_position || "center";
        
        // Gap configurations if they don't exist
        if (!settings.flex_gap) {
          settings.flex_gap = { 
            unit: "px", 
            size: 10,
            column: "10",
            row: "10",
            isLinked: true
          };
        }
        
        // Basic responsive configurations
        if (!settings.flex_direction_tablet) {
          settings.flex_direction_tablet = "column";
        }
        
        if (!settings.flex_gap_tablet) {
          settings.flex_gap_tablet = {
            column: "0",
            row: "2",
            isLinked: false,
            unit: "rem",
            size: 0
          };
        }
        
        if (!settings.flex_gap_mobile) {
          settings.flex_gap_mobile = {
            isLinked: true,
            unit: "rem"
          };
        }
        
        // Preserve direct colors in the element
        preserveDirectColors(settings);
        
        newElement.settings = settings;
      } else {
        // If no settings, create basic configurations
        newElement.settings = {
          content_width: "boxed",
          flex_direction: "column",
          flex_wrap: "nowrap",
          container_type: "flex",
          content_position: "center",
          flex_gap: { unit: "px", size: 10, column: "10", row: "10", isLinked: true }
        };
      }
    } else if (newElement.settings) {
      // For other element types, also preserve direct colors
      preserveDirectColors(newElement.settings);
    }
    
    // Process child elements recursively
    if (newElement.elements && Array.isArray(newElement.elements)) {
      newElement.elements = transformElementsToContainer(newElement.elements);
    }
    
    return newElement;
  });
};

// Function to preserve direct colors in elements
const preserveDirectColors = (settings: any) => {
  if (!settings) return;
  
  // Replace global color references with direct values
  Object.keys(settings).forEach(key => {
    // Look for __globals__ properties that affect colors
    const globalKey = `__globals__${key}`;
    
    if (settings[globalKey] && typeof settings[globalKey] === 'string') {
      // Remove global color reference, keep only direct value
      delete settings[globalKey];
      
      // If no direct color value is defined, set a default value
      // This is only necessary if the base color property is not defined
      if (key.includes('color') && !settings[key]) {
        if (key.includes('background')) {
          settings[key] = '#ffffff'; // White as default for backgrounds
        } else {
          settings[key] = '#333333'; // Dark gray as default for texts
        }
      }
    }
  });
  
  // Recursively process nested objects that may contain colors
  Object.keys(settings).forEach(key => {
    if (settings[key] && typeof settings[key] === 'object' && !Array.isArray(settings[key])) {
      preserveDirectColors(settings[key]);
    }
  });
};

// Helper function to extract all widgets from a nested structure
export const flattenElements = (elements: any[]): any[] => {
  let result: any[] = [];
  
  elements.forEach(element => {
    // If not a container/section/column, add as widget
    if (element.elType !== "section" && element.elType !== "column" && element.elType !== "container") {
      // Apply consistent inline styles to widgets
      const styledElement = applyConsistentStyles(element);
      result.push(styledElement);
    }
    
    // Process child elements recursively
    if (element.elements && Array.isArray(element.elements)) {
      result = result.concat(flattenElements(element.elements));
    }
  });
  
  return result;
};

// Function to apply consistent styles to widgets
const applyConsistentStyles = (widget: any): any => {
  const newWidget = { ...widget };
  
  if (!newWidget.settings) {
    newWidget.settings = {};
  }
  
  // Apply default font-family to all text widgets
  if (newWidget.elType === "widget" && 
    (newWidget.widgetType === "heading" || 
     newWidget.widgetType === "text-editor" || 
     newWidget.widgetType === "button")) {
    
    // Set font-family as DMSANS
    newWidget.settings.typography_font_family = "DMSANS";
    
    // Apply consistent colors
    if (newWidget.widgetType === "heading") {
      if (!newWidget.settings.title_color) {
        newWidget.settings.title_color = "#131313"; // Primary color
      }
    } else if (newWidget.widgetType === "text-editor") {
      if (!newWidget.settings.text_color) {
        newWidget.settings.text_color = "#454545"; // Text color
      }
    } else if (newWidget.widgetType === "button") {
      if (!newWidget.settings.button_text_color) {
        newWidget.settings.button_text_color = "#FFFFFF"; // White
      }
      if (!newWidget.settings.button_background_color) {
        newWidget.settings.button_background_color = "#131313"; // Primary color
      }
    }
  }
  
  return newWidget;
};
