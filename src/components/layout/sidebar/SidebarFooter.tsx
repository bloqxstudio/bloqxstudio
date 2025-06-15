
import React from 'react';
import { Globe } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

interface SidebarFooterProps {
  sitesCount: number;
}

export function SidebarFooter({ sitesCount }: SidebarFooterProps) {
  if (sitesCount === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="text-center text-muted-foreground text-sm py-8 px-4">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum site WordPress conectado</p>
            <p className="text-xs mt-1">Conecte um site para ver categorias</p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <div className="text-xs text-muted-foreground border-t pt-4 px-2">
          <p>Categorias sincronizadas dos seus sites WordPress.</p>
          <p className="mt-1">Clique no ícone de atualização para sincronizar.</p>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
