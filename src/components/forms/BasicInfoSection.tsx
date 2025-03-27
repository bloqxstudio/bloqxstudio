
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import { Category } from '@/lib/database.types';

interface BasicInfoSectionProps {
  form: UseFormReturn<FormValues>;
  categories: Category[];
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form }) => {
  return (
    <div>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título*</FormLabel>
            <FormControl>
              <Input placeholder="Hero de lançamento" {...field} />
            </FormControl>
            <FormDescription>
              Nome descritivo do componente
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoSection;
