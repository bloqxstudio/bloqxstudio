
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

interface VisibilityOptionsProps {
  form: UseFormReturn<any>;
}

const VisibilityOptions: React.FC<VisibilityOptionsProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="visibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Visibilidade</FormLabel>
          <FormControl>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="public"
                  checked={field.value === 'public'}
                  onChange={() => field.onChange('public')}
                  className="h-4 w-4 text-primary"
                />
                <span>Público</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="private"
                  checked={field.value === 'private'}
                  onChange={() => field.onChange('private')}
                  className="h-4 w-4 text-primary"
                />
                <span>Privado</span>
              </label>
            </div>
          </FormControl>
          <FormDescription>
            Componentes públicos podem ser vistos por todos os usuários
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VisibilityOptions;
