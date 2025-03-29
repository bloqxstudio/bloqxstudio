
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileJson, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { validateJson } from '@/utils/jsonUtils';

interface JsonFileUploaderProps {
  onJsonLoaded: (jsonContent: string) => void;
}

const JsonFileUploader: React.FC<JsonFileUploaderProps> = ({ onJsonLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setIsLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        // Validate if it's valid JSON
        if (!validateJson(content)) {
          toast.error('O arquivo não contém JSON válido');
          setIsLoading(false);
          return;
        }
        
        // Pass the content to parent component
        onJsonLoaded(content);
        toast.success('Arquivo JSON carregado com sucesso!');
      } catch (error) {
        console.error('Erro ao processar arquivo JSON:', error);
        toast.error('Erro ao processar o arquivo JSON');
      } finally {
        setIsLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div 
      className={`flex flex-col items-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer mb-6 ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      
      <FileJson className={`h-12 w-12 mb-2 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
      
      <div className="text-center">
        <p className="text-sm font-medium">
          {isLoading ? 'Processando...' : 'Clique para fazer upload do JSON do Elementor'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          ou arraste e solte o arquivo aqui
        </p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-4"
        disabled={isLoading}
      >
        <Upload className="h-4 w-4 mr-2" />
        Selecionar Arquivo
      </Button>
    </div>
  );
};

export default JsonFileUploader;
