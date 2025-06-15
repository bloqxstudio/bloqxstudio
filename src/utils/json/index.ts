
/**
 * Export all JSON utilities
 */
import { validateJson, validateElementorJson } from './validators';
import { cleanElementorJson } from './cleaners';
import { transformElementsToContainer, removeStyleProperties, removeEmptyProperties } from './transformers';
import { getTemplate } from './templates';
import { mergeComponentsJson } from './mergeJson';

// Generate unique ID for Elementor elements
const generateElementorId = (): string => {
  return Math.random().toString(36).substr(2, 7);
};

// Generate template with proper JSON stringification
export const generateBloqxkitElementorTemplate = (templateType = 'hero'): string => {
  const template = getTemplate(templateType);
  return JSON.stringify(template, null, 2);
};

// Centralized function for standard JSON transformation - generates EXACT Supabase/Elementor structure
export const getStandardTransformedJson = (jsonString: string): string => {
  if (!jsonString || jsonString.trim() === '') {
    throw new Error('Empty or invalid JSON input');
  }

  try {
    // Parse the input JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Invalid JSON format');
    }

    // Extract elements from various possible structures
    let elements = [];
    
    if (parsedJson.type === "elementor" && Array.isArray(parsedJson.elements)) {
      elements = parsedJson.elements;
    } else if (parsedJson.content && Array.isArray(parsedJson.content)) {
      elements = parsedJson.content;
    } else if (Array.isArray(parsedJson) && parsedJson.length > 0 && parsedJson[0]?.elType) {
      elements = parsedJson;
    } else if (Array.isArray(parsedJson)) {
      elements = parsedJson;
    } else {
      // If no valid structure found, wrap the content
      elements = [parsedJson];
    }

    // Transform elements to proper container structure
    const transformedElements = transformElementsToContainer(elements);

    // Create the EXACT Supabase/Elementor standard structure
    const standardStructure = {
      type: "elementor",
      siteurl: "https://superelements.io/wp-json/", // Using Superelements as the product URL
      elements: [
        {
          id: generateElementorId(),
          elType: "container",
          isInner: false,
          isLocked: false,
          settings: {
            structure: "20",
            padding: {
              unit: "px",
              top: "85",
              right: "0", 
              bottom: "85",
              left: "0",
              isLinked: false
            },
            padding_tablet: {
              unit: "px",
              top: "60",
              right: "20",
              bottom: "60", 
              left: "20",
              isLinked: false
            },
            padding_mobile: {
              unit: "px",
              top: "40",
              right: "15",
              bottom: "40",
              left: "15", 
              isLinked: false
            },
            content_width: "boxed",
            boxed_width: {
              unit: "px",
              size: 1200,
              sizes: []
            },
            flex_direction: "column",
            flex_wrap: "nowrap",
            content_position: "center"
          },
          elements: transformedElements
        }
      ]
    };

    // Clean and optimize the structure
    const cleanedStructure = removeEmptyProperties(standardStructure);

    // Return as compact JSON string (no pretty formatting for production use)
    return JSON.stringify(cleanedStructure);

  } catch (error) {
    console.error('Error in getStandardTransformedJson:', error);
    throw new Error(`Failed to transform JSON: ${error.message}`);
  }
};

// Re-export all utilities
export {
  validateJson,
  validateElementorJson,
  cleanElementorJson,
  transformElementsToContainer,
  removeEmptyProperties,
  removeStyleProperties,
  mergeComponentsJson
};
