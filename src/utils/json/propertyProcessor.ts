
/**
 * Property processing utilities for cleaning and managing JSON properties
 */

// Função para remover propriedades vazias recursivamente
export const removeEmptyProperties = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeEmptyProperties(item))
              .filter(item => item !== null && item !== undefined && item !== '');
  }
  
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    // Preservar propriedades de cores mesmo se parecerem vazias
    const isColorProperty = key.includes('color') || key.includes('_color');
    
    // Ignorar propriedades que começam com '__', exceto __globals__ quando é necessário preservar cores
    if (key.startsWith('__') && (!isColorProperty || !key.includes('__globals__'))) {
      return;
    }
    
    const value = obj[key];
    
    // Verificar se é um objeto vazio
    if (value && typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        return; // Pular objetos vazios
      }
      
      // Processar objetos que têm propriedades como unit, size, etc. mas todos os valores são vazios
      if (
        value.unit !== undefined && 
        Object.keys(value).every(k => 
          k === 'unit' || 
          (k !== 'unit' && (value[k] === '' || value[k] === undefined || value[k] === null))
        )
      ) {
        return; // Pular objetos que só têm a propriedade unit com valor significativo
      }
      
      // Para arrays e objetos que têm todas as propriedades vazias
      if (Array.isArray(value) && value.length === 0) {
        return; // Pular arrays vazios
      }
      
      // Processar recursivamente
      const cleaned = removeEmptyProperties(value);
      
      // Verificar se o resultado da limpeza não está vazio
      if (cleaned && typeof cleaned === 'object' && Object.keys(cleaned).length === 0) {
        return; // Pular o resultado se estiver vazio
      }
      
      result[key] = cleaned;
    } else if (value !== '' && value !== null && value !== undefined) {
      // Manter valores primitivos não vazios
      result[key] = value;
    } else if (isColorProperty) {
      // Preservar propriedades de cores mesmo se o valor for vazio
      result[key] = value;
    }
  });
  
  return result;
};
