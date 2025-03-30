
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
