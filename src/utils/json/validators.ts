
/**
 * JSON validation utilities
 */

export const validateJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateElementorJson = (jsonObj: any): boolean => {
  // Validação básica da estrutura
  if (!jsonObj || typeof jsonObj !== 'object') return false;
  
  // Verificar o formato 1: estrutura com "type": "elementor"
  if (jsonObj.type === "elementor" && Array.isArray(jsonObj.elements)) {
    return true;
  }
  
  // Verificar o formato 2: estrutura com "content" contendo elementos
  if (jsonObj.content && Array.isArray(jsonObj.content)) {
    return true;
  }
  
  // Verificar o formato 3: estrutura direta de elementos
  if (Array.isArray(jsonObj) && jsonObj.length > 0 && jsonObj[0].elType) {
    return true;
  }
  
  // Verificar se é uma exportação de página do Elementor
  if (jsonObj.content && jsonObj.page_settings) {
    return true;
  }
  
  return false;
};
