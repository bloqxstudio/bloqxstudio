
export const cleanElementorJson = (dirtyJson: string): string => {
  try {
    const parsed = JSON.parse(dirtyJson);
    const cleaned = formatElementorJson(parsed);
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
export const formatElementorJson = (jsonObj: any): any => {
  if (!jsonObj || typeof jsonObj !== 'object') return jsonObj;
  
  // Ensure basic structure
  const formatted = {
    type: "elementor",
    siteurl: jsonObj.siteurl || "https://example.com/",
    elements: Array.isArray(jsonObj.elements) ? jsonObj.elements : []
  };
  
  // Format elements recursively
  formatted.elements = formatElements(formatted.elements);
  
  return formatted;
};

// Recursively format elements
const formatElements = (elements: any[], parentIndex = ""): any[] => {
  return elements.map((element, index) => {
    const currentIndex = parentIndex ? `${parentIndex}_${index + 1}` : `${index + 1}`;
    
    // Format current element
    const formatted = cleanElement(element, currentIndex);
    
    // Format child elements if they exist
    if (Array.isArray(formatted.elements) && formatted.elements.length > 0) {
      formatted.elements = formatElements(formatted.elements, currentIndex);
    }
    
    return formatted;
  });
};

// Clean a single element
const cleanElement = (element: any, index: string): any => {
  if (!element || typeof element !== 'object') return element;
  
  const result = { ...element };
  
  // Add title based on type and index
  const elementType = element.elType || "unknown";
  const widgetType = element.widgetType || "";
  result._title = `${index.padStart(2, '0')}_${elementType}${widgetType ? `_${widgetType}` : ""}`;
  
  // Clean settings
  if (result.settings && typeof result.settings === 'object') {
    result.settings = cleanSettings(result.settings);
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

// Clean settings object by removing unnecessary properties
const cleanSettings = (settings: any): any => {
  if (!settings || typeof settings !== 'object') return settings;
  
  const cleanedSettings: any = {};
  
  // Process each setting
  Object.entries(settings).forEach(([key, value]) => {
    // Skip properties to remove
    if (shouldRemoveProperty(key)) return;
    
    // Normalize values
    const normalizedValue = normalizeValue(value);
    
    // Only add non-empty values
    if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== '') {
      cleanedSettings[key] = normalizedValue;
    }
  });
  
  return cleanedSettings;
};

// Check if a property should be removed
const shouldRemoveProperty = (key: string): boolean => {
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
  
  return removePatterns.some(pattern => key.includes(pattern));
};

// Normalize values like units, padding, etc.
const normalizeValue = (value: any): any => {
  if (value === null || value === undefined) return null;
  
  // If it's an object with unit properties, normalize
  if (typeof value === 'object' && value !== null) {
    // Handle unit objects
    if (value.unit && (typeof value.size === 'number' || typeof value.size === 'string')) {
      // Convert string numbers to actual numbers
      const size = typeof value.size === 'string' ? parseFloat(value.size) : value.size;
      return { unit: value.unit, size };
    }
    
    // Handle padding/margin objects with top, right, bottom, left
    if ('top' in value || 'right' in value || 'bottom' in value || 'left' in value) {
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
      // Skip empty values
      const normalized = normalizeValue(v);
      if (normalized !== null && normalized !== undefined && normalized !== '') {
        result[k] = normalized;
      }
    });
    return Object.keys(result).length > 0 ? result : null;
  }
  
  // Return primitives as is
  return value;
};
