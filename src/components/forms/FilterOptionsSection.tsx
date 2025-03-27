
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
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
import { 
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface FilterOptionsSectionProps {
  form: UseFormReturn<FormValues>;
}

const FilterOptionsSection: React.FC<FilterOptionsSectionProps> = ({ form }) => {
  // Get the current elements value or default to empty array
  const elements = form.watch('elements') || [];

  // Toggle element in the array
  const toggleElement = (value: string) => {
    const currentElements = form.watch('elements') || [];
    const newElements = currentElements.includes(value)
      ? currentElements.filter(v => v !== value)
      : [...currentElements, value] as any;
    
    form.setValue('elements', newElements, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Helper to check if element is selected
  const isElementSelected = (value: string) => {
    return elements.includes(value);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Opções de Filtragem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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

          <div>
            <FormLabel className="block mb-2">Elementos</FormLabel>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="elements-image" 
                  checked={isElementSelected('image')}
                  onCheckedChange={() => toggleElement('image')}
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
                  checked={isElementSelected('heading')}
                  onCheckedChange={() => toggleElement('heading')}
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
                  checked={isElementSelected('button')}
                  onCheckedChange={() => toggleElement('button')}
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
                  checked={isElementSelected('list')}
                  onCheckedChange={() => toggleElement('list')}
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
                  checked={isElementSelected('video')}
                  onCheckedChange={() => toggleElement('video')}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterOptionsSection;
