
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface JsonFormFieldProps {
  form: UseFormReturn<any>;
  onJsonChange: (value: string) => void;
}

const JsonFormField: React.FC<JsonFormFieldProps> = ({ form, onJsonChange }) => {
  return (
    <FormField
      control={form.control}
      name="jsonCode"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Código JSON do Elementor</FormLabel>
          
          <FormControl>
            <Textarea 
              placeholder='{"type": "elementor", "elements": [...]}'
              className="min-h-[200px] font-mono text-sm"
              value={field.value}
              onChange={(e) => {
                field.onChange(e);
                onJsonChange(e.target.value);
              }}
            />
          </FormControl>
          
          <FormDescription>
            Cole o código JSON do Elementor para transformá-lo em container
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default JsonFormField;
