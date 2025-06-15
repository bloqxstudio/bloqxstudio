
/**
 * Utilities for cleaning and formatting Elementor JSON
 */
import { validateJson } from './validators';
import { transformElementsToContainer, removeEmptyProperties, applyStandardStructure } from './transformers';

export const cleanElementorJson = (jsonString: string, removeStyles = false, wrapInContainer = true, applyStructure = false): string => {
  try {
    // Handle empty or null input
    if (!jsonString || jsonString.trim() === '') {
      return JSON.stringify({
        type: "elementor",
        siteurl: "https://bloqxstudio.com/",
        elements: [],
        globals: {}
      });
    }

    // Validar primeiro
    if (!validateJson(jsonString)) {
      console.warn('Invalid JSON format, returning original');
      return jsonString;
    }

    // Analisar o JSON
    let jsonObj;
    try {
      jsonObj = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return jsonString;
    }

    let elements = [];
    
    // Determinar onde estão os elementos com base na estrutura
    if (jsonObj.type === "elementor" && Array.isArray(jsonObj.elements)) {
      // Formato 1: estrutura com type: "elementor"
      elements = jsonObj.elements;
    } else if (jsonObj.content && Array.isArray(jsonObj.content)) {
      // Formato 2: estrutura com "content" contendo elementos
      elements = jsonObj.content;
    } else if (Array.isArray(jsonObj) && jsonObj.length > 0 && jsonObj[0]?.elType) {
      // Formato 3: estrutura direta de elementos
      elements = jsonObj;
    } else if (jsonObj.content && jsonObj.page_settings) {
      // Exportação de página completa
      elements = [jsonObj.content];
    } else if (Array.isArray(jsonObj)) {
      // Pode ser um array de elementos
      elements = jsonObj;
    } else {
      // Se não conseguir determinar a estrutura, retornar o original
      console.warn('Unrecognized JSON structure, returning original');
      return jsonString;
    }

    // Aplicar a estrutura padrão ou apenas transformar elementos para container
    try {
      if (applyStructure) {
        // Aplicar a estrutura padrão com containers aninhados
        elements = applyStandardStructure(elements);
      } else {
        // Transformar elementos para container com as configurações especificadas
        elements = transformElementsToContainer(elements);
      }
    } catch (transformError) {
      console.error('Error transforming elements:', transformError);
      // Continue with original elements if transformation fails
    }

    // Formato básico e compacto
    const cleaned = {
      type: "elementor",
      siteurl: jsonObj.siteurl || "https://bloqxstudio.com/", // Usar o site bloqxstudio.com como padrão
      elements: elements || [],
      // Preservar cores globais do JSON original se existirem
      globals: jsonObj.globals || {}
    };

    // Remover propriedades vazias para reduzir o tamanho
    let optimizedCleaned;
    try {
      optimizedCleaned = removeEmptyProperties(cleaned);
    } catch (removeError) {
      console.error('Error removing empty properties:', removeError);
      optimizedCleaned = cleaned;
    }

    // Usar uma serialização mais compacta para reduzir o tamanho do JSON
    return JSON.stringify(optimizedCleaned);
  } catch (e) {
    console.error("Erro ao limpar JSON:", e);
    return jsonString; // Retornar o original em caso de erro
  }
};
