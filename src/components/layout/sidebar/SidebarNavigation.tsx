
import React from 'react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface SidebarNavigationProps {
  selectedCategory: string | null;
  selectedSite: string | null;
  totalPostCount: number;
  onClearFilters: () => void;
}

export function SidebarNavigation({ 
  selectedCategory, 
  selectedSite, 
  totalPostCount, 
  onClearFilters 
}: SidebarNavigationProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegação</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                console.log('🔄 Clearing all filters');
                onClearFilters();
              }}
              isActive={!selectedCategory && !selectedSite}
            >
              <span>Todos os Componentes</span>
              <span className="ml-auto text-xs text-muted-foreground">
                ({totalPostCount})
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
