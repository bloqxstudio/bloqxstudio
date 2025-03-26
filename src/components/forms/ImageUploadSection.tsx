
import React from 'react';
import { FormLabel, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

interface ImageUploadSectionProps {
  selectedFile: File | null;
  imagePreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ 
  selectedFile, 
  imagePreview, 
  onFileChange 
}) => {
  return (
    <div className="space-y-2">
      <FormLabel>Imagem de Pré-visualização</FormLabel>
      <div className="border border-input rounded-md p-4">
        <div className="flex items-center gap-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Selecionar Imagem
          </Button>
          <Input 
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <p className="text-sm text-muted-foreground">
            {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado (opcional)"}
          </p>
        </div>
        
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Pré-visualização:</p>
            <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
      <FormDescription>
        Adicione uma imagem para representar visualmente o componente (opcional)
      </FormDescription>
    </div>
  );
};

export default ImageUploadSection;
