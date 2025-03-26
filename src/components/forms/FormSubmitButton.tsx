
import React from 'react';
import { Button } from '@/components/ui';
import { Save } from 'lucide-react';

interface FormSubmitButtonProps {
  isSubmitting: boolean;
}

const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({ isSubmitting }) => {
  return (
    <div className="flex justify-end">
      <Button 
        type="submit" 
        className="gap-2" 
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" 
                 aria-hidden="true" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Salvar Componente
          </>
        )}
      </Button>
    </div>
  );
};

export default FormSubmitButton;
