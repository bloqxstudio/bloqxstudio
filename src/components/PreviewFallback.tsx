
import React, { useMemo } from 'react';
import { Component } from '@/core/types';
import { 
  Layout, 
  Image, 
  Type, 
  Square, 
  Video, 
  List,
  Button as ButtonIcon,
  Layers
} from 'lucide-react';

interface PreviewFallbackProps {
  component: Component;
  className?: string;
}

const PreviewFallback: React.FC<PreviewFallbackProps> = ({ component, className = '' }) => {
  const { gradientColors, elementIcons, layoutType } = useMemo(() => {
    // Analisar JSON para extrair informações visuais
    let jsonData: any = {};
    try {
      jsonData = JSON.parse(component.json_code || component.code || '[]');
    } catch (error) {
      console.warn('Erro ao parsear JSON do componente:', error);
    }

    // Determinar cores baseadas na categoria e tags
    const categoryColors: Record<string, string[]> = {
      'cabecalho': ['from-blue-500', 'to-blue-700'],
      'secoes-hero': ['from-purple-500', 'to-pink-600'],
      'destaques': ['from-green-500', 'to-emerald-600'],
      'depoimentos': ['from-yellow-500', 'to-orange-600'],
      'rodape': ['from-gray-600', 'to-gray-800'],
      'contato': ['from-cyan-500', 'to-blue-600'],
      'precos': ['from-indigo-500', 'to-purple-600'],
      'equipe': ['from-teal-500', 'to-cyan-600'],
      'default': ['from-slate-500', 'to-slate-700']
    };

    const gradientColors = categoryColors[component.category] || categoryColors.default;

    // Determinar ícones baseados nos elementos presentes
    const elementIcons: React.ReactNode[] = [];
    const jsonString = JSON.stringify(jsonData);
    
    if (jsonString.includes('heading') || jsonString.includes('title')) {
      elementIcons.push(<Type key="heading" className="w-4 h-4" />);
    }
    if (jsonString.includes('image') || jsonString.includes('img')) {
      elementIcons.push(<Image key="image" className="w-4 h-4" />);
    }
    if (jsonString.includes('button')) {
      elementIcons.push(<ButtonIcon key="button" className="w-4 h-4" />);
    }
    if (jsonString.includes('video')) {
      elementIcons.push(<Video key="video" className="w-4 h-4" />);
    }
    if (jsonString.includes('list')) {
      elementIcons.push(<List key="list" className="w-4 h-4" />);
    }

    // Se não encontrou elementos específicos, usar ícone genérico
    if (elementIcons.length === 0) {
      elementIcons.push(<Layout key="layout" className="w-4 h-4" />);
    }

    // Determinar tipo de layout baseado na estrutura
    let layoutType = 'simple';
    if (jsonString.includes('column') && jsonString.includes('row')) {
      layoutType = 'grid';
    } else if (jsonString.includes('section')) {
      layoutType = 'sections';
    }

    return { gradientColors, elementIcons, layoutType };
  }, [component]);

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${gradientColors[0]} ${gradientColors[1]} ${className}`}>
      {/* Padrão de fundo sutil */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                             radial-gradient(circle at 80% 30%, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px, 40px 40px',
          }}
        />
      </div>

      {/* Conteúdo do preview */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Título do componente */}
        <div className="text-white">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">
            {component.title}
          </h3>
          <div className="flex items-center gap-1 flex-wrap">
            {elementIcons.slice(0, 4).map((icon, index) => (
              <div key={index} className="text-white/70">
                {icon}
              </div>
            ))}
            {elementIcons.length > 4 && (
              <span className="text-white/70 text-xs">+{elementIcons.length - 4}</span>
            )}
          </div>
        </div>

        {/* Representação visual do layout */}
        <div className="flex-1 flex items-center justify-center py-4">
          {layoutType === 'grid' && (
            <div className="grid grid-cols-2 gap-2 w-full max-w-20">
              <div className="bg-white/20 rounded h-6"></div>
              <div className="bg-white/20 rounded h-6"></div>
              <div className="bg-white/30 rounded h-4 col-span-2"></div>
            </div>
          )}
          {layoutType === 'sections' && (
            <div className="w-full max-w-24 space-y-2">
              <div className="bg-white/30 rounded h-3"></div>
              <div className="bg-white/20 rounded h-8"></div>
              <div className="bg-white/20 rounded h-2"></div>
            </div>
          )}
          {layoutType === 'simple' && (
            <div className="w-full max-w-20 space-y-2">
              <div className="bg-white/30 rounded h-4"></div>
              <div className="bg-white/20 rounded h-12"></div>
            </div>
          )}
        </div>

        {/* Badge de categoria */}
        <div className="flex justify-between items-end">
          <span className="text-xs text-white/80 capitalize">
            {component.category.replace('-', ' ')}
          </span>
          <Layers className="w-3 h-3 text-white/60" />
        </div>
      </div>

      {/* Indicador de preview gerado */}
      <div className="absolute top-2 right-2">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default PreviewFallback;
