
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../componentFormSchema';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ColumnsFilterSectionProps {
  form: UseFormReturn<FormValues>;
}

const ColumnsFilterSection: React.FC<ColumnsFilterSectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="columns"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Colunas</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o número de colunas" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="1">1 Coluna</SelectItem>
              <SelectItem value="2">2 Colunas</SelectItem>
              <SelectItem value="3+">3 ou mais colunas</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Número de colunas que o componente contém
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ColumnsFilterSection;
