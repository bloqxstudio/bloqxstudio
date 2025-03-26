import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Button } from '@/components/ui/button';
import { AlertCircle as LucideAlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateJson } from '@/utils/jsonUtils';

interface ElementorPreviewProps {
  jsonContent: string;
}

const ElementorPreview: React.FC<ElementorPreviewProps> = ({ jsonContent }) => {
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!validateJson(jsonContent)) {
        setError('JSON inválido. Verifique a sintaxe do código.');
        setParsedContent(null);
        return;
      }

      const parsed = JSON.parse(jsonContent);
      if (parsed.type !== 'elementor' || !parsed.elements) {
        setError('Este não parece ser um JSON válido do Elementor.');
        setParsedContent(null);
        return;
      }

      setParsedContent(parsed);
      setError(null);
    } catch (err) {
      setError('Erro ao processar o JSON. Verifique a sintaxe.');
      setParsedContent(null);
    }
  }, [jsonContent]);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <LucideAlertCircle className="h-4 w-4" />
        <AlertTitle>Erro na visualização</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!parsedContent) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Carregando visualização...</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden shadow-md">
      <CardContent className="p-0">
        <div className="bg-gray-100 p-4 space-y-8">
          {renderElementorContent(parsedContent.elements)}
        </div>
      </CardContent>
    </Card>
  );
};

const renderElementorContent = (elements: any[]) => {
  if (!elements || !Array.isArray(elements)) {
    return <p className="text-gray-500 p-4">Sem elementos para visualizar</p>;
  }

  return elements.map((element, index) => (
    <div key={index} className="elementor-element">
      {renderElement(element)}
    </div>
  ));
};

const renderElement = (element: any) => {
  const { elType, widgetType, settings, elements } = element;
  const title = element._title || 'Elemento';
  
  switch (elType) {
    case 'section':
      return (
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-xs text-gray-400 mb-2">{title}</div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {elements && renderElementorContent(elements)}
          </div>
        </section>
      );
    
    case 'column':
      const colSpan = settings?.width?.size 
        ? Math.round(settings.width.size * 12 / 100) 
        : 12;
      
      return (
        <div className={`col-span-${colSpan} bg-gray-50 p-4 rounded`}>
          <div className="text-xs text-gray-400 mb-2">{title}</div>
          {elements && renderElementorContent(elements)}
        </div>
      );
    
    case 'widget':
      return renderWidget(widgetType, settings, title);
    
    default:
      return (
        <div className="bg-gray-200 p-4 rounded">
          <p className="text-sm text-gray-600">Elemento desconhecido: {elType}</p>
        </div>
      );
  }
};

const renderWidget = (widgetType: string, settings: any, title: string) => {
  switch (widgetType) {
    case 'heading':
      const headingContent = settings?.title || 'Título Aqui';
      const headingSize = determineHeadingSize(settings?.header_size || 'h2');
      
      return (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">{title}</div>
          <div className={`${headingSize} font-semibold text-gray-800`}>
            {headingContent}
          </div>
        </div>
      );
    
    case 'text-editor':
      const textContent = settings?.editor || 'Texto de descrição aqui. Este é um texto genérico que serve como placeholder para o conteúdo real.';
      
      return (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">{title}</div>
          <div className="text-gray-600">
            {textContent}
          </div>
        </div>
      );
    
    case 'button':
      const buttonText = settings?.text || 'Botão Principal';
      const buttonLink = settings?.link?.url || '#';
      
      return (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">{title}</div>
          <Button variant="outline" className="bg-black text-white hover:bg-gray-800">
            {buttonText}
          </Button>
        </div>
      );
    
    case 'image':
      const altText = settings?.alt || 'Imagem Genérica';
      const aspectRatio = determineImageAspectRatio(settings);
      
      return (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">{title}</div>
          <PlaceholderImage 
            aspectRatio={aspectRatio} 
            text={altText}
            className="w-full" 
          />
        </div>
      );
    
    case 'icon':
      return (
        <div className="mb-4 flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-1">{title}</div>
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
            <span>Ícone</span>
          </div>
        </div>
      );
    
    case 'icon-box':
      const iconBoxTitle = settings?.title_text || 'Item da Lista';
      const iconBoxDescription = settings?.description_text || 'Descrição do item. Este é um texto genérico usado como placeholder.';
      
      return (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
          <div className="text-xs text-gray-400 mb-1">{title}</div>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-gray-600">Ícone</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">{iconBoxTitle}</h4>
              <p className="text-sm text-gray-600">{iconBoxDescription}</p>
            </div>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="p-4 bg-gray-100 rounded mb-4">
          <div className="text-xs text-gray-400 mb-1">{title}</div>
          <p className="text-sm text-gray-600">Widget: {widgetType || 'Desconhecido'}</p>
        </div>
      );
  }
};

const determineHeadingSize = (headingTag: string): string => {
  switch (headingTag) {
    case 'h1': return 'text-4xl';
    case 'h2': return 'text-3xl';
    case 'h3': return 'text-2xl';
    case 'h4': return 'text-xl';
    case 'h5': return 'text-lg';
    case 'h6': return 'text-base font-bold';
    default: return 'text-3xl';
  }
};

const determineImageAspectRatio = (settings: any): 'square' | 'video' | 'portrait' | 'wide' | 'auto' => {
  if (!settings) return 'video';
  
  if (settings.ratio) {
    const ratio = settings.ratio.toLowerCase();
    if (ratio.includes('1:1')) return 'square';
    if (ratio.includes('16:9') || ratio.includes('4:3')) return 'video';
    if (ratio.includes('3:4') || ratio.includes('9:16')) return 'portrait';
  }
  
  return 'video';
};

export default ElementorPreview;
