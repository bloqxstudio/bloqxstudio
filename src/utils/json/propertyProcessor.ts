/**
 * Property processing utilities for cleaning and managing JSON properties
 */

// Function to recursively remove empty properties
export const removeEmptyProperties = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeEmptyProperties(item))
              .filter(item => item !== null && item !== undefined && item !== '');
  }
  
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    // Preserve color properties even if they seem empty
    const isColorProperty = key.includes('color') || key.includes('_color');
    
    // Ignore properties starting with '__', except __globals__ when necessary to preserve colors
    if (key.startsWith('__') && (!isColorProperty || !key.includes('__globals__'))) {
      return;
    }
    
    const value = obj[key];
    
    // Check if it's an empty object
    if (value && typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        return; // Skip empty objects
      }
      
      // Process objects that have properties like unit, size, etc. but all values are empty
      if (
        value.unit !== undefined && 
        Object.keys(value).every(k => 
          k === 'unit' || 
          (k !== 'unit' && (value[k] === '' || value[k] === undefined || value[k] === null))
        )
      ) {
        return; // Skip objects that only have meaningful unit property
      }
      
      // For arrays and objects that have all empty properties
      if (Array.isArray(value) && value.length === 0) {
        return; // Skip empty arrays
      }
      
      // Process recursively
      const cleaned = removeEmptyProperties(value);
      
      // Check if cleaning result is not empty
      if (cleaned && typeof cleaned === 'object' && Object.keys(cleaned).length === 0) {
        return; // Skip result if it's empty
      }
      
      result[key] = cleaned;
    } else if (value !== '' && value !== null && value !== undefined) {
      // Keep non-empty primitive values
      result[key] = value;
    } else if (isColorProperty) {
      // Preserve color properties even if value is empty
      result[key] = value;
    }
  });
  
  return result;
};
