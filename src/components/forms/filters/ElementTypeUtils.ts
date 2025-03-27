
import { ElementType } from '../componentFormSchema';

// Utility function to check if an element is selected
export const isElementSelected = (elements: ElementType[], value: ElementType): boolean => {
  return elements.includes(value);
};

// Utility function to toggle an element in the array
export const toggleElement = (
  currentElements: ElementType[] = [], 
  value: ElementType
): ElementType[] => {
  return currentElements.includes(value)
    ? currentElements.filter(v => v !== value)
    : [...currentElements, value];
};
