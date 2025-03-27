
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../componentFormSchema';
import AlignmentFilterSection from './AlignmentFilterSection';
import ColumnsFilterSection from './ColumnsFilterSection';
import ElementsFilterSection from './ElementsFilterSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface FilterSectionProps {
  form: UseFormReturn<FormValues>;
}

const FilterSection: React.FC<FilterSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Filtros do Componente</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AlignmentFilterSection form={form} />
        <ColumnsFilterSection form={form} />
        <ElementsFilterSection form={form} />
      </CardContent>
    </Card>
  );
};

export default FilterSection;
