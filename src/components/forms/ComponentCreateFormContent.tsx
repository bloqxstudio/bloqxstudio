
import React from 'react';
import { Form } from '@/components/ui';
import { FormValues } from './componentFormSchema';
import { UseFormReturn } from 'react-hook-form';

// Import the smaller components
import BasicInfoSection from './BasicInfoSection';
import VisibilitySection from './VisibilitySection';
import TagsSection from './TagsSection';
import ImageUploadSection from './ImageUploadSection';
import JsonCodeSection from './JsonCodeSection';
import FormSubmitButton from './FormSubmitButton';
import FilterSection from './filters/FilterSection';

interface ComponentCreateFormContentProps {
  form: UseFormReturn<FormValues>;
  selectedFile: File | null;
  imagePreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessJson: () => void;
  onSubmit: (values: FormValues) => void;
  isUploading: boolean;
  isPending: boolean;
}

const ComponentCreateFormContent: React.FC<ComponentCreateFormContentProps> = ({
  form,
  selectedFile,
  imagePreview,
  onFileChange,
  onProcessJson,
  onSubmit,
  isUploading,
  isPending
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        
        <JsonCodeSection 
          form={form}
          onProcessJson={onProcessJson}
          simplified={true}
        />
        
        <FormSubmitButton isLoading={isPending || isUploading} />
      </form>
    </Form>
  );
};

export default ComponentCreateFormContent;
