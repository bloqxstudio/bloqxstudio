
/**
 * Template exports for pre-built Elementor components
 */
import { getHeroTemplate } from './heroTemplate';
import { getFormTemplate } from './formTemplate';
import { getFeaturesTemplate } from './featuresTemplate';

export const getTemplate = (templateType: string) => {
  switch (templateType.toLowerCase()) {
    case 'hero':
      return getHeroTemplate();
    case 'form':
      return getFormTemplate();
    case 'features':
      return getFeaturesTemplate();
    default:
      return getHeroTemplate(); // Default to hero template
  }
};
