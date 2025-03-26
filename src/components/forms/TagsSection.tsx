
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';

interface TagsSectionProps {
  form: UseFormReturn<FormValues>;
}

const TagsSection: React.FC<TagsSectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            <Input 
              placeholder="hero, lançamento, produto" 
              {...field} 
              aria-describedby="tags-description"
            />
          </FormControl>
          <FormDescription id="tags-description">
            Adicione tags separadas por vírgula (opcional)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TagsSection;
