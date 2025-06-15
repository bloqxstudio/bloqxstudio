
/**
 * Structure processing utilities for Elementor components
 */
import { flattenElements } from './elementProcessor';

// Function to apply standard structure with nested containers
export const applyStandardStructure = (elements: any[]): any[] => {
  if (!elements || elements.length === 0) return [];

  // Collect all original elements
  const allElements = flattenElements(elements);
  
  // Create standard structure
  const structuredComponent = [
    {
      elType: "container", // Section
      settings: {
        content_width: "full",
        flex_direction: "row",
        width: { unit: "%", size: 100 },
        margin: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
        padding: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
      },
      elements: [
        {
          elType: "container", // Padding
          settings: {
            content_width: "boxed",
            flex_direction: "column",
            padding: {
              top: { unit: "rem", size: 6, sizes: [] },
              bottom: { unit: "rem", size: 6, sizes: [] },
              left: { unit: "rem", size: 1, sizes: [] },
              right: { unit: "rem", size: 1, sizes: [] }
            },
            responsive_padding: {
              tablet: {
                top: { unit: "rem", size: 5, sizes: [] },
                bottom: { unit: "rem", size: 5, sizes: [] },
                left: { unit: "rem", size: 2, sizes: [] },
                right: { unit: "rem", size: 2, sizes: [] }
              },
              mobile: {
                top: { unit: "rem", size: 4, sizes: [] },
                bottom: { unit: "rem", size: 4, sizes: [] },
                left: { unit: "rem", size: 1, sizes: [] },
                right: { unit: "rem", size: 1, sizes: [] }
              }
            }
          },
          elements: [
            {
              elType: "container", // Row
              settings: {
                content_width: "full",
                flex_direction: "row",
                width: { unit: "%", size: 100 },
                padding: { top: "0", bottom: "0", left: "0", right: "0", unit: "px" },
                margin: { top: "0", bottom: "0", left: "auto", right: "auto", unit: "px" }
              },
              elements: [
                {
                  elType: "container", // Column
                  settings: {
                    content_width: "full",
                    flex_direction: "column",
                    flex_gap: {
                      unit: "px",
                      size: 24, // Default gap (multiple of 8)
                      sizes: []
                    },
                    content_position: "center"
                  },
                  elements: organizeWidgetsInContentGroups(allElements)
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  return structuredComponent;
};

// Function to organize widgets in content groups when necessary
const organizeWidgetsInContentGroups = (widgets: any[]): any[] => {
  // Simplification: put everything in a single content group
  // In a more complete implementation, we would analyze widget types
  // and group them more intelligently
  
  if (widgets.length <= 1) {
    return widgets;
  }
  
  // For this basic implementation, group all widgets in one content group
  return [{
    elType: "container", // Content Group
    settings: {
      content_width: "full",
      flex_direction: "column",
      flex_gap: {
        unit: "px",
        size: 16,
        sizes: []
      },
      content_position: "center",
      text_align: "center" // Center text by default
    },
    elements: widgets
  }];
};
