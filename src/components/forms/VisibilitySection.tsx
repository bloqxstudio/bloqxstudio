
import React from 'react';
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';

interface VisibilitySectionProps {
  form: UseFormReturn<FormValues>;
}

const VisibilitySection: React.FC<VisibilitySectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="visibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Visibilidade</FormLabel>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="public"
                checked={field.value === 'public'}
                onChange={() => field.onChange('public')}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span>Público</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="private"
                checked={field.value === 'private'}
                onChange={() => field.onChange('private')}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span>Privado</span>
            </label>
          </div>
          <FormDescription>
            Componentes públicos ficam visíveis para todos os usuários
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VisibilitySection;
