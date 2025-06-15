
/**
 * JSON transformation utilities for Elementor components
 * This file re-exports all transformation utilities from specialized modules
 */

// Re-export element processing utilities
export {
  transformElementsToContainer,
  flattenElements
} from './elementProcessor';

// Re-export structure processing utilities
export {
  applyStandardStructure
} from './structureProcessor';

// Re-export property processing utilities
export {
  removeEmptyProperties
} from './propertyProcessor';

// Re-export style processing utilities
export {
  removeStyleProperties
} from './styleProcessor';
