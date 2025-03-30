
import { Component } from '@/lib/database.types';
import { validateJson } from './validators';

/**
 * Merges multiple JSON components into a single cohesive JSON
 * 
 * @param components Array of components to merge
 * @returns String containing the merged JSON
 */
export const mergeComponentsJson = (components: Component[]): string => {
  try {
    if (!components.length) {
      return "";
    }

    // Ensure all component JSON is valid and extract elements
    const allElements: any[] = components.reduce((elementsArray: any[], component: Component) => {
      // Use json_code if available, or fall back to code
      const jsonCode = component.json_code || component.code;
      
      if (!jsonCode || !validateJson(jsonCode)) {
        console.warn(`Invalid JSON found in component: ${component.title}`);
        return elementsArray;
      }

      try {
        const parsed = JSON.parse(jsonCode);
        
        // Extract elements based on JSON structure
        let componentElements: any[] = [];
        if (parsed.elements && Array.isArray(parsed.elements)) {
          // Standard Elementor format with elements array
          componentElements = parsed.elements;
        } else if (parsed.type === "elementor" && parsed.elements && Array.isArray(parsed.elements)) {
          // Type-specified Elementor format
          componentElements = parsed.elements;
        } else if (Array.isArray(parsed)) {
          // Direct array of elements
          componentElements = parsed;
        }
        
        return [...elementsArray, ...componentElements];
      } catch (err) {
        console.error(`Error parsing JSON for component: ${component.title}`, err);
        return elementsArray;
      }
    }, []);

    // Create the merged JSON structure
    const mergedJson = {
      type: "elementor",
      siteurl: "https://example.com/",
      elements: allElements
    };

    return JSON.stringify(mergedJson, null, 2);
  } catch (err) {
    console.error("Error merging components JSON", err);
    return "";
  }
};
