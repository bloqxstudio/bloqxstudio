
export const cleanElementorJson = (dirtyJson: string): string => {
  try {
    const parsed = JSON.parse(dirtyJson);
    const cleaned = {
      elements: parsed.elements || [],
      settings: parsed.settings || {},
    };
    return JSON.stringify(cleaned, null, 2);
  } catch (e) {
    console.error("Error cleaning JSON:", e);
    return dirtyJson;
  }
};

export const validateJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
};
