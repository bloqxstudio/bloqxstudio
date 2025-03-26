
import React from 'react';
import { Button } from '@/components/ui';
import { Save } from 'lucide-react';

interface FormSubmitButtonProps {
  isLoading: boolean;
}

const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({ isLoading }) => {
  return (
    <div className="flex justify-end">
      <Button 
        type="submit" 
        className="gap-2" 
        disabled={isLoading}
        aria-disabled={isLoading}
      >
        {isLoading ? (
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
