
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues, ElementType } from '../componentFormSchema';
import { Checkbox } from '@/components/ui';
import { FormDescription, FormLabel } from '@/components/ui/form';
import { isElementSelected, toggleElement } from './ElementTypeUtils';

interface ElementsFilterSectionProps {
  form: UseFormReturn<FormValues>;
}

const ElementsFilterSection: React.FC<ElementsFilterSectionProps> = ({ form }) => {
  // Get the current elements value or default to empty array
  const elements = form.watch('elements') || [];

  // Handle element toggle with form update
  const handleElementToggle = (value: ElementType) => {
    const currentElements = form.watch('elements') || [];
    const newElements = toggleElement(currentElements, value);
    
    form.setValue('elements', newElements, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  
  return (
    <div>
      <FormLabel className="block mb-2">Elementos</FormLabel>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="elements-image" 
            checked={isElementSelected(elements, 'image' as ElementType)}
            onCheckedChange={() => handleElementToggle('image' as ElementType)}
          />
          <label
            htmlFor="elements-image"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Imagens
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="elements-heading" 
            checked={isElementSelected(elements, 'heading' as ElementType)}
            onCheckedChange={() => handleElementToggle('heading' as ElementType)}
          />
          <label
            htmlFor="elements-heading"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Títulos
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="elements-button" 
            checked={isElementSelected(elements, 'button' as ElementType)}
            onCheckedChange={() => handleElementToggle('button' as ElementType)}
          />
          <label
            htmlFor="elements-button"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Botões
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="elements-list" 
            checked={isElementSelected(elements, 'list' as ElementType)}
            onCheckedChange={() => handleElementToggle('list' as ElementType)}
          />
          <label
            htmlFor="elements-list"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Listas
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="elements-video" 
            checked={isElementSelected(elements, 'video' as ElementType)}
            onCheckedChange={() => handleElementToggle('video' as ElementType)}
          />
          <label
            htmlFor="elements-video"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Vídeos
          </label>
        </div>
      </div>
      <FormDescription className="mt-1">
        Selecione os elementos principais utilizados no componente
      </FormDescription>
    </div>
  );
};

export default ElementsFilterSection;
