
/**
 * Export all JSON utilities
 */
import { validateJson, validateElementorJson } from './validators';
import { cleanElementorJson } from './cleaners';
import { transformElementsToContainer, removeStyleProperties, removeEmptyProperties } from './transformers';
import { getTemplate } from './templates';
import { mergeComponentsJson } from './mergeJson';

// Generate unique ID for Elementor elements (7 characters alphanumeric)
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

    // Process and transform elements to proper container structure
    const processedElements = transformElementsToContainer(elements);

    // Create the EXACT Supabase/Elementor standard structure with CORRECT siteurl
    const standardStructure = {
      type: "elementor",
      siteurl: "https://bloqxstudio.com/wp-json/",
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
              unit: "rem",
              top: "4",
              right: "1",
              bottom: "4",
              left: "1",
              isLinked: false
            },
            padding_mobile: {
              unit: "rem",
              isLinked: false
            },
            flex_direction: "row",
            flex_align_items: "stretch",
            flex_gap: {
              size: 10,
              column: "10",
              row: "10",
              unit: "px",
              isLinked: true
            },
            container_type: "flex",
            content_width: "boxed",
            width: { unit: "%" },
            width_tablet: { unit: "px" },
            width_mobile: { unit: "px" },
            boxed_width: { unit: "px" },
            boxed_width_tablet: { unit: "px" },
            boxed_width_mobile: { unit: "px" },
            min_height: { unit: "px" },
            min_height_tablet: { unit: "px" },
            min_height_mobile: { unit: "px" },
            flex_direction_tablet: "column",
            flex__is_row: "row",
            flex__is_column: "column",
            flex_justify_content_tablet: "center",
            flex_align_items_tablet: "center",
            flex_gap_tablet: {
              column: "0",
              row: "4",
              isLinked: false,
              unit: "rem",
              size: 0
            },
            flex_gap_mobile: {
              isLinked: true,
              unit: "rem"
            },
            grid_outline: "yes",
            grid_columns_grid: { unit: "fr", size: 3 },
            grid_columns_grid_tablet: { unit: "fr" },
            grid_columns_grid_mobile: { unit: "fr", size: 1 },
            grid_rows_grid: { unit: "fr", size: 2 },
            grid_rows_grid_tablet: { unit: "fr" },
            grid_rows_grid_mobile: { unit: "fr" },
            grid_gaps: { isLinked: true, unit: "px" },
            grid_gaps_tablet: { isLinked: true, unit: "px" },
            grid_gaps_mobile: { isLinked: true, unit: "px" },
            grid_auto_flow: "row",
            grid_auto_flow_tablet: "row",
            grid_auto_flow_mobile: "row",
            grid__is_row: "row",
            grid__is_column: "column",
            background_color: "",
            background_color_stop: { unit: "%", size: 0 },
            background_color_b: "#f2295b",
            background_color_b_stop: { unit: "%", size: 100 },
            background_gradient_type: "linear",
            background_gradient_angle: { unit: "deg", size: 180 },
            background_gradient_position: "center center",
            background_xpos: { unit: "px", size: 0 },
            background_xpos_tablet: { unit: "px", size: 0 },
            background_xpos_mobile: { unit: "px", size: 0 },
            background_ypos: { unit: "px", size: 0 },
            background_ypos_tablet: { unit: "px", size: 0 },
            background_ypos_mobile: { unit: "px", size: 0 },
            background_bg_width: { unit: "%", size: 100 },
            background_bg_width_tablet: { unit: "px" },
            background_bg_width_mobile: { unit: "px" },
            background_slideshow_loop: "yes",
            background_slideshow_slide_duration: 5000,
            background_slideshow_slide_transition: "fade",
            background_slideshow_transition_duration: 500,
            background_slideshow_ken_burns_zoom_direction: "in",
            margin: { unit: "px", isLinked: true },
            margin_tablet: { unit: "px", isLinked: true },
            margin_mobile: { unit: "px", isLinked: true },
            _flex_grow: 1,
            _flex_shrink: 1,
            _offset_orientation_h: "start",
            _offset_x: { unit: "px", size: 0 },
            _offset_x_tablet: { unit: "px" },
            _offset_x_mobile: { unit: "px" },
            _offset_x_end: { unit: "px", size: 0 },
            _offset_x_end_tablet: { unit: "px" },
            _offset_x_end_mobile: { unit: "px" },
            _offset_orientation_v: "start",
            _offset_y: { unit: "px", size: 0 },
            _offset_y_tablet: { unit: "px" },
            _offset_y_mobile: { unit: "px" }
          },
          elements: processedElements
        }
      ]
    };

    // Return as compact JSON string (matching Supabase format)
    return JSON.stringify(standardStructure);

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
