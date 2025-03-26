
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './componentFormSchema';
import ComponentFormActions from './ComponentFormActions';
import CodeViewer from '@/components/CodeViewer';

interface JsonCodeSectionProps {
  form: UseFormReturn<FormValues>;
  showPreview: boolean;
  previewJson: string;
  onCleanJson: () => void;
  onPreviewJson: () => void;
}

const JsonCodeSection: React.FC<JsonCodeSectionProps> = ({ 
  form, 
  showPreview, 
  previewJson, 
  onCleanJson, 
  onPreviewJson 
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="jsonCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código JSON do Elementor*</FormLabel>
            <ComponentFormActions 
              onCleanJson={onCleanJson}
              onPreviewJson={onPreviewJson}
            />
            <FormControl>
              <Textarea 
                placeholder='{"type": "elementor", "elements": [...]}'
                className="min-h-[200px] font-mono text-sm"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Cole o código JSON do Elementor aqui
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {showPreview && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-lg font-medium mb-3">Pré-visualização:</h3>
          <CodeViewer code={previewJson} title="JSON Formatado" />
        </div>
      )}
    </>
  );
};

export default JsonCodeSection;
