import { Component } from '@/core/types';
import { validateJson } from './validators';
import { toast } from 'sonner';

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
        toast.error(`Cannot merge invalid JSON from component: ${component.title}`, {
          duration: 3000,
        });
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
        
        // Add component title as a comment to help identify elements in the merged JSON
        if (componentElements.length && component.title) {
          const firstElement = componentElements[0];
          if (firstElement && typeof firstElement === 'object') {
            firstElement._component_source = component.title;
          }
        }
        
        return [...elementsArray, ...componentElements];
      } catch (err) {
        console.error(`Error parsing JSON for component: ${component.title}`, err);
        toast.error(`Error merging component: ${component.title}`, {
          duration: 3000,
        });
        return elementsArray;
      }
    }, []);

    // Create the merged JSON structure with Elementor format
    const mergedJson = {
      type: "elementor",
      siteurl: "https://example.com/",
      elements: allElements
    };

    return JSON.stringify(mergedJson, null, 2);
  } catch (err) {
    console.error("Error merging components JSON", err);
    toast.error("Error merging components JSON", {
      duration: 3000,
    });
    return "";
  }
};

/**
 * Formats an array of components as a human-readable list for display
 * 
 * @param components Array of components
 * @returns Formatted string listing components
 */
export const formatComponentsListForExport = (components: Component[]): string => {
  if (!components.length) return "No components selected";
  
  if (components.length === 1) {
    return `1 component: ${components[0].title}`;
  }
  
  return `${components.length} components: ${components.map(c => c.title).join(", ")}`;
};
