
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Component } from '@/lib/database.types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, Tag, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
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

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    // Use json_code if available, otherwise fall back to code
    const codeContent = component.json_code || component.code;
    navigator.clipboard.writeText(codeContent);
    toast.success('Código copiado para a área de transferência!');
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
                Ver detalhes
              </Button>
            </div>
            {component.visibility === 'private' && (
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  <Lock className="h-3 w-3 mr-1" /> Privado
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
        <CardFooter className="p-4 pt-0 flex items-center justify-between gap-4">
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
          <Button 
            size="sm" 
            variant="outline" 
            className="hover-lift"
            onClick={handleCopyCode}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copiar
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso restrito</DialogTitle>
            <DialogDescription>
              Você precisa estar logado para copiar o código deste componente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-center text-muted-foreground">
              Crie sua conta gratuita para acessar este e muitos outros componentes Elementor.
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/login" onClick={() => setShowAuthDialog(false)}>
                Entrar
              </Link>
            </Button>
            <Button asChild>
              <Link to="/register" onClick={() => setShowAuthDialog(false)}>
                Criar conta
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComponentCard;
