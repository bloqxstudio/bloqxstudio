
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import AlignmentFilterSection from './filters/AlignmentFilterSection';
import ColumnsFilterSection from './filters/ColumnsFilterSection';
import ElementsFilterSection from './filters/ElementsFilterSection';

interface FilterOptionsSectionProps {
  form: UseFormReturn<FormValues>;
}

const FilterOptionsSection: React.FC<FilterOptionsSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Opções de Filtragem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AlignmentFilterSection form={form} />
          <ColumnsFilterSection form={form} />
          <ElementsFilterSection form={form} />
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterOptionsSection;
