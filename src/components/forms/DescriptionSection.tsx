
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';

interface DescriptionSectionProps {
  form: UseFormReturn<FormValues>;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Descreva o propósito e funcionalidade deste componente" 
              className="resize-none" 
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Explique brevemente para que serve este componente (opcional)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DescriptionSection;
