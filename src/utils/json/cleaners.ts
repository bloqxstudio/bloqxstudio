
/**
 * Utilities for cleaning and formatting Elementor JSON
 */
import { validateJson } from './validators';
import { transformElementsToContainer } from './transformers';

export const cleanElementorJson = (jsonString: string, removeStyles = false, wrapInContainer = true): string => {
  try {
    // Validar primeiro
    if (!validateJson(jsonString)) {
      throw new Error('Formato JSON inválido');
    }

    // Analisar o JSON
    const jsonObj = JSON.parse(jsonString);
    let elements = [];
    
    // Determinar onde estão os elementos com base na estrutura
    if (jsonObj.type === "elementor" && Array.isArray(jsonObj.elements)) {
      // Formato 1: estrutura com type: "elementor"
      elements = jsonObj.elements;
    } else if (jsonObj.content && Array.isArray(jsonObj.content)) {
      // Formato 2: estrutura com "content" contendo elementos
      elements = jsonObj.content;
    } else if (Array.isArray(jsonObj) && jsonObj.length > 0 && jsonObj[0].elType) {
      // Formato 3: estrutura direta de elementos
      elements = jsonObj;
    } else if (jsonObj.content && jsonObj.page_settings) {
      // Exportação de página completa
      elements = [jsonObj.content];
    } else {
      // Tente encontrar elementos aninhados de alguma forma
      if (Array.isArray(jsonObj) && jsonObj.length > 0) {
        // Pode ser um array de elementos
        elements = jsonObj;
      } else {
        throw new Error('Estrutura JSON incompatível');
      }
    }

    // Sempre transformar elementos para container com as novas configurações padrão
    elements = transformElementsToContainer(elements);

    // Formato básico
    const cleaned = {
      type: "elementor",
      siteurl: jsonObj.siteurl || "https://example.com/",
      elements: elements || []
    };

    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Erro ao limpar JSON:", e);
    return jsonString; // Retornar o original em caso de erro
  }
};
