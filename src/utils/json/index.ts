
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

// Centralized function for standard JSON transformation - matches JsonTransformer exactly
export const getStandardTransformedJson = (jsonString: string): string => {
  if (!jsonString || jsonString.trim() === '') {
    throw new Error('Empty or invalid JSON input');
  }

  // Apply the EXACT same transformation rules used in JsonTransformer
  // This ensures perfect compatibility with Elementor and consistent output
  return cleanElementorJson(
    jsonString,
    false,        // removeStyles = false (preserve styles)
    true,         // wrapInContainer = true 
    true          // applyStructure = true (apply standard BloqxKit structure)
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
