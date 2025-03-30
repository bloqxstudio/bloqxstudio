
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import BasicInfoSection from './BasicInfoSection';
import VisibilitySection from './VisibilitySection';
import TagsSection from './TagsSection';
import ImageUploadSection from './ImageUploadSection';
import FilterSection from './filters/FilterSection';

interface ComponentFormFieldsProps {
  form: UseFormReturn<FormValues>;
  selectedFile: File | null;
  imagePreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ComponentFormFields: React.FC<ComponentFormFieldsProps> = ({
  form,
  selectedFile,
  imagePreview,
  onFileChange
}) => {
  return (
    <>
      <BasicInfoSection form={form} categories={[]} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VisibilitySection form={form} />
        <TagsSection form={form} />
      </div>
      
      <ImageUploadSection 
        selectedFile={selectedFile}
        imagePreview={imagePreview}
        onFileChange={onFileChange} 
      />
      
      <FilterSection form={form} />
    </>
  );
};

export default ComponentFormFields;
