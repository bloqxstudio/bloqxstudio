
/**
 * Export all JSON utilities
 */
import { validateJson, validateElementorJson } from './validators';
import { cleanElementorJson } from './cleaners';
import { transformElementsToContainer, removeStyleProperties, removeEmptyProperties } from './transformers';
import { getTemplate } from './templates';
import { mergeComponentsJson } from './mergeJson';

// Generate template with proper JSON stringification
export const generateBloqxkitElementorTemplate = (templateType = 'hero'): string => {
  const template = getTemplate(templateType);
  return JSON.stringify(template, null, 2);
};

// Centralized function for standard JSON transformation
export const getStandardTransformedJson = (jsonString: string): string => {
  if (!jsonString || jsonString.trim() === '') {
    throw new Error('Empty or invalid JSON input');
  }

  // Apply standard transformation rules used in JsonTransformer
  return cleanElementorJson(
    jsonString,
    false,        // removeStyles = false (preserve styles)
    true,         // wrapInContainer = true 
    true          // applyStructure = true (apply standard structure)
  );
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
