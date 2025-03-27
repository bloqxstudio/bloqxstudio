
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
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface AlignmentFilterSectionProps {
  form: UseFormReturn<FormValues>;
}

const AlignmentFilterSection: React.FC<AlignmentFilterSectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="alignment"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Alinhamento</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o alinhamento" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="left" className="flex items-center">
                <div className="flex items-center">
                  <AlignLeft className="h-4 w-4 mr-2" /> Esquerda
                </div>
              </SelectItem>
              <SelectItem value="center">
                <div className="flex items-center">
                  <AlignCenter className="h-4 w-4 mr-2" /> Centro
                </div>
              </SelectItem>
              <SelectItem value="right">
                <div className="flex items-center">
                  <AlignRight className="h-4 w-4 mr-2" /> Direita
                </div>
              </SelectItem>
              <SelectItem value="full">
                <div className="flex items-center">
                  <AlignJustify className="h-4 w-4 mr-2" /> Largura Total
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Alinhamento principal do componente
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AlignmentFilterSection;
