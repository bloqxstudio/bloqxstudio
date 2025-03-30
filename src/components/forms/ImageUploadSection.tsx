
import React, { useState, useEffect, useRef } from 'react';
import { FormLabel, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

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
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Create a custom file change handler that accepts File objects
  const handleFileObject = (file: File) => {
    // Create a synthetic event object
    const syntheticEvent = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    onFileChange(syntheticEvent);
  };
  
  // Handle clipboard paste events
  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileObject(file);
          toast.success('Imagem colada com sucesso!');
          break;
        }
      }
    }
  };
  
  // Set up paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);
  
  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileObject(file);
        toast.success('Imagem adicionada com sucesso!');
      } else {
        toast.error('Por favor, solte apenas arquivos de imagem.');
      }
    }
  };
  
  return (
    <div className="space-y-2">
      <FormLabel>Imagem de Pré-visualização</FormLabel>
      <div 
        ref={dropZoneRef}
        className={`border ${isDragging ? 'border-primary border-dashed bg-primary/5' : 'border-input'} rounded-md p-4`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
        
        {imagePreview ? (
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
        ) : (
          <div className="mt-4 border border-dashed border-muted-foreground/30 rounded-md p-6 flex flex-col items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Arraste e solte uma imagem aqui ou <br />
              <span className="font-medium text-primary">cole do clipboard</span>
            </p>
          </div>
        )}
      </div>
      <FormDescription>
        Adicione uma imagem para representar visualmente o componente (opcional).<br />
        <span className="text-xs text-primary">Dica: Você pode colar uma imagem diretamente do clipboard (Ctrl+V)!</span>
      </FormDescription>
    </div>
  );
};

export default ImageUploadSection;
