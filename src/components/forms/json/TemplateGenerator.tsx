
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateBloqxkitElementorTemplate } from '@/utils/json';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Wand2 } from 'lucide-react';

interface TemplateGeneratorProps {
  onTemplateGenerated: (jsonContent: string) => void;
}

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({ 
  onTemplateGenerated 
}) => {
  const [templateType, setTemplateType] = useState('hero');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = () => {
    setIsGenerating(true);
    
    try {
      // Gerar o template de acordo com o tipo selecionado
      const generatedTemplate = generateBloqxkitElementorTemplate(templateType);
      
      // Chamar a função callback com o template gerado
      onTemplateGenerated(generatedTemplate);
      
      toast.success(`Template "${templateType}" gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      toast.error('Erro ao gerar o template. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-muted/30 p-4 rounded-md border mb-4">
      <h3 className="text-base font-medium mb-2">Gerar Template Pronto</h3>
      
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Gere automaticamente um template JSON Elementor compatível com o padrão Bloqxkit.
        </p>
        
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-full sm:w-auto">
            <label className="text-sm font-medium mb-1 block">Tipo de Template</label>
            <Select
              value={templateType}
              onValueChange={(value) => setTemplateType(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo de Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="form">Formulário</SelectItem>
                <SelectItem value="features">Recursos/Features</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-1"
          >
            <Wand2 size={16} />
            {isGenerating ? 'Gerando...' : 'Gerar Template'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateGenerator;
