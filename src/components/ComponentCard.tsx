import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Component } from '@/core/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Eye, Tag, Lock, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

interface ComponentCardProps {
  component: Component;
  className?: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();
  const { 
    addComponent, 
    removeComponent, 
    isComponentSelected 
  } = useSelectedComponents();

  const isSelected = isComponentSelected(component.id);
  
  // Get language preference - this would come from a language context in a real implementation
  const language = localStorage.getItem('language') || 'en';
  
  const getTranslation = (en: string, pt: string) => {
    return language === 'pt' ? pt : en;
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    // Use json_code if available, otherwise fall back to code
    const codeContent = component.json_code || component.code;
    navigator.clipboard.writeText(codeContent);
    toast.success(getTranslation(
      'Code copied to clipboard!', 
      'Código copiado para a área de transferência!'
    ));
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    const codeContent = component.json_code || component.code;
    const filename = `${component.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    // Create blob and download it
    const blob = new Blob([codeContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(getTranslation(
      `Downloaded ${filename}`, 
      `${filename} baixado com sucesso`
    ));
  };

  const handleSelectToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (isSelected) {
      removeComponent(component.id);
      toast.info(getTranslation(
        `Component "${component.title}" removed from selection`,
        `Componente "${component.title}" removido da seleção`
      ));
    } else {
      addComponent(component);
      toast.success(getTranslation(
        `Component "${component.title}" added to selection`,
        `Componente "${component.title}" adicionado à seleção`
      ));
    }
  };

  // Determine image source with fallback
  const imageSrc = component.preview_image || '/placeholder.svg';

  // Get tags as array, ensuring backward compatibility
  const tags = component.tags || [];

  return (
    <>
      <Card 
        className={`component-card overflow-hidden ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/component/${component.id}`}>
          <CardHeader className="p-0 relative h-[200px] overflow-hidden group">
            <img 
              src={imageSrc} 
              alt={component.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="sm" className="gap-1">
                <Eye className="h-4 w-4" />
                {getTranslation('View details', 'Ver detalhes')}
              </Button>
            </div>
            {component.visibility === 'private' && (
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  <Lock className="h-3 w-3 mr-1" /> {getTranslation('Private', 'Privado')}
                </Badge>
              </div>
            )}
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-green-500 text-white">
                  <Check className="h-3 w-3 mr-1" /> {getTranslation('Selected', 'Selecionado')}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg truncate">{component.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2 h-10 mt-1">
              {component.description}
            </p>
          </CardContent>
        </Link>
        <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs px-2 py-0 h-5">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="hover-lift p-1 h-8 w-8"
              onClick={handleCopyCode}
              title={getTranslation('Copy to Elementor', 'Copiar para Elementor')}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="hover-lift p-1 h-8 w-8"
              onClick={handleDownload}
              title={getTranslation('Download component', 'Baixar componente')}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              className={`hover-lift ${isSelected ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={handleSelectToggle}
              title={isSelected ? 
                getTranslation('Remove from selection', 'Remover da seleção') : 
                getTranslation('Add to selection', 'Adicionar à seleção')}
            >
              {isSelected ? (
                <Check className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-1" />
              )}
              {isSelected ? 
                getTranslation('Selected', 'Selecionado') : 
                getTranslation('Select', 'Selecionar')}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getTranslation('Create a Free Account', 'Crie uma Conta Grátis')}</DialogTitle>
            <DialogDescription>
              {getTranslation(
                'You need to be logged in to use this component.',
                'Você precisa estar logado para utilizar este componente.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-center text-muted-foreground">
              {getTranslation(
                'Our platform is currently in BETA and 100% FREE. Create your account to access all Elementor components.',
                'Nossa plataforma está atualmente em BETA e é 100% GRATUITA. Crie sua conta para acessar todos os componentes Elementor.'
              )}
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/login" onClick={() => setShowAuthDialog(false)}>
                {getTranslation('Login', 'Entrar')}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/register" onClick={() => setShowAuthDialog(false)}>
                {getTranslation('Register Now', 'Registrar Agora')}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComponentCard;
